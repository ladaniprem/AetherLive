"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useState } from "react";
import { createScript } from "../../utils";

export const IntegrationsView = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const { organization } = useOrganization();

  const handleIntegrationClick = (integrationId: IntegrationId) => {
    if (!organization) {
      toast.error("Organization ID not found");
      return;
    }

    const snippet = createScript(integrationId, organization.id);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <IntegrationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
      <div className="flex min-h-screen flex-col bg-muted p-4 sm:p-6 md:p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Setup & Integrations</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Choose the integration that&apos;s right for you
            </p>
          </div>
          <div className="mt-6 md:mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label className="sm:w-34 shrink-0 text-sm md:text-base" htmlFor="organization-id">
                Organization ID
              </Label>
              <Input 
                disabled
                id="organization-id"
                readOnly
                value={organization?.id ?? ""}
                className="flex-1 bg-background font-mono text-xs sm:text-sm"
              />
              <Button
                className="gap-2 shrink-0"
                onClick={handleCopy}
                size="sm"
              >
                <CopyIcon className="size-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>

          <Separator className="my-6 md:my-8" />
          <div className="space-y-6">
            <div className="space-y-1">
              <Label className="text-base md:text-lg">Integrations</Label>
              <p className="text-muted-foreground text-xs md:text-sm">
                Add the following code to your website to enable the chatbox.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => handleIntegrationClick(integration.id)}
                  type="button"
                  className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-background p-3 sm:p-4 hover:bg-accent sm:flex-row sm:justify-start"
                >
                  <Image
                    alt={integration.title}
                    height={32}
                    src={integration.icon}
                    width={32}
                    className="size-6 sm:size-8"
                  />
                  <p className="text-xs sm:text-sm truncate">{integration.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Integrate with your website</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Follow these steps to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-xs md:text-sm">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[200px] sm:max-h-[300px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-md bg-foreground p-2 sm:p-3 font-mono text-secondary text-[10px] sm:text-xs md:text-sm">
                {snippet}
              </pre>
              <Button
                className="absolute top-2 right-2 sm:top-4 sm:right-6 size-5 sm:size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopy}
                size="icon"
                variant="secondary"
              >
                <CopyIcon className="size-2 sm:size-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-xs md:text-sm">
              2. Add the code in your page
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              Paste the chatbox code above in your page. You can add it in the HTML head section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
