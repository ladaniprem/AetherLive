"use client";

import Vapi from "@vapi-ai/web";
import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

// Same voice-call experience as the widget: Vapi web call with live transcript.
// Keys come from the org's DB settings (public key only) — never the private key.
export const useDashboardVapi = (organizationId: string | undefined) => {
  const vapiSecrets = useQuery(
    api.public.secrets.getVapiSecrets,
    organizationId ? { organizationId } : "skip",
  );
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip",
  );

  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }

    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("error", (error) => {
      console.log(error, "VAPI_ERROR");
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        typeof message.text === "string" &&
        message.text.trim().length > 0 &&
        (message.role === "user" || message.role === "assistant")
      ) {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role,
            text: message.text,
          },
        ]);
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, [vapiSecrets]);

  const canCall = !!vapiSecrets && !!widgetSettings?.vapiSettings?.assistantId;

  const startCall = () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) {
      return;
    }
    setIsConnecting(true);

    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
    // Reset immediately so a stuck "Connecting..." never traps the UI,
    // even if the SDK fails to fire call-end (e.g. Krisp worklet error).
    setIsConnecting(false);
    setIsConnected(false);
    setIsSpeaking(false);
  };

  return {
    canCall,
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
};
