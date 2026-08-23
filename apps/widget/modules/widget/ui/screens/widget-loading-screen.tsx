"use client";
import { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, csrfTokenAtom, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, vapiSecretsAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({ organizationId }: { organizationId: string | null }) => {
  const [step, setStep] = useState<InitStep>("org")
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setCsrfToken = useSetAtom(csrfTokenAtom);
  const setVapiSecrets = useSetAtom(vapiSecretsAtom);

  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));

  const greetMessage = useAtomValue(widgetSettingsAtom)?.greetMessage;

  // Step 1: Validate organization (query, reactive)
  const orgValidation = useQuery(
    api.public.organizations.validate,
    step === "org" && organizationId ? { organizationId } : "skip",
  );
  useEffect(() => {
    if (step !== "org" || !organizationId) {
      if (step === "org" && !organizationId) {
        setErrorMessage("Organization ID is required");
        setScreen("error");
      }
      return;
    }

    if (orgValidation === undefined) {
      setLoadingMessage("Verifying organization...");
      return;
    }

    if (orgValidation.valid) {
      setOrganizationId(organizationId);
      setStep("session");
    } else {
      setErrorMessage(orgValidation.reason || "Invalid configuration");
      setScreen("error");
    }
  }, [step, organizationId, orgValidation, setErrorMessage, setScreen, setOrganizationId, setLoadingMessage]);

  // Step 2: Validate session
  const validateContactSession = useMutation(api.public.contactSessions.validate);
  useEffect(() => {
    if (step !== "session") {
      return;
    }

    setLoadingMessage("Finding contact session ID...");

    if (!contactSessionId) {
      console.log("[widget] no contactSessionId for org — proceeding to settings");
      setSessionValid(false);
      setStep("settings");
      return;
    }

    setLoadingMessage("Validating session...");

    validateContactSession({ contactSessionId })
      .then((result) => {
        console.log("[widget] session valid:", result);
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch((error) => {
        console.error("[widget] session validation failed:", error);
        setSessionValid(false);
        setStep("settings");
      })
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  // Step 3: Load Widget Settings
  const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId, 
    organizationId ? {
      organizationId,
    } : "skip",
  );
  useEffect(() => {
    if (step !== "settings") {
      return;
    }

    setLoadingMessage("Loading widget settings...");

    if (widgetSettings !== undefined) {
      setWidgetSettings(widgetSettings);
      setStep("vapi");
    }
  }, [
    step,
    widgetSettings,
    setStep,
    setWidgetSettings,
    setLoadingMessage,
  ]);

  // Step 4: Load Vapi secrets (query, reactive)
  const vapiSecrets = useQuery(
    api.public.secrets.getVapiSecrets,
    step === "vapi" && organizationId ? { organizationId } : "skip",
  );
  useEffect(() => {
    if (step !== "vapi") {
      return;
    }

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    if (vapiSecrets === undefined) {
      setLoadingMessage("Loading voice features...");
      return;
    }

    setVapiSecrets(vapiSecrets);
    setStep("done");
  }, [step, organizationId, vapiSecrets, setVapiSecrets, setLoadingMessage, setErrorMessage, setScreen]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">
            {greetMessage || "Hi there! 👋"}
          </p>
          <p className="text-lg">
            Let&apos;s get you started
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">
         {loadingMessage || "Loading..."}
        </p>
      </div>
    </>
  );
};
