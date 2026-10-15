import { ArrowLeftIcon, MicIcon, MicOffIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { useVapi } from "@/modules/widget/hooks/use-vapi";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdAtomFamily,
  organizationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { cn } from "@workspace/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useEffect, useRef } from "react";

export const WidgetVoiceScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const {
    isConnected,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    isConnecting,
  } = useVapi();

  // File the finished call into the visitor's chat as conversation messages.
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const session = useQuery(
    api.public.contactSessions.getOne,
    contactSessionId ? { contactSessionId } : "skip",
  );
  const createConversation = useMutation(api.public.conversations.create);
  const saveTranscript = useMutation(api.public.messages.saveTranscript);
  const transcriptSavedRef = useRef(false);

  useEffect(() => {
    if (isConnected || isConnecting) {
      transcriptSavedRef.current = false;
      return;
    }
  }, [isConnected, isConnecting]);

  useEffect(() => {
    if (isConnected || isConnecting) return;
    if (transcriptSavedRef.current || transcript.length === 0) return;
    if (!contactSessionId || !organizationId) return;
    // Wait for the session lookup — saving before it resolves would
    // create a duplicate conversation instead of reusing the open one.
    if (session === undefined) return;
    transcriptSavedRef.current = true;
    (async () => {
      try {
        let conversationId = session?.conversationId;
        if (!conversationId) {
          conversationId = await createConversation({
            contactSessionId,
            organizationId,
          });
        }
        await saveTranscript({
          conversationId,
          contactSessionId,
          lines: transcript.map((line) => ({
            role: line.role,
            text: line.text,
          })),
        });
      } catch (error) {
        console.warn("[widget] saving call transcript failed:", error);
      }
    })();
  }, [isConnected, isConnecting, transcript, session]);

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            variant="transparent"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Voice Chat</p>
        </div>
        {(isConnected || isConnecting) && (
          <Button size="sm" variant="destructive" onClick={() => endCall()}>
            <MicOffIcon />
            {isConnected ? "End call" : "Cancel"}
          </Button>
        )}
      </WidgetHeader>
      {transcript.length > 0 ? (
        <AIConversation className="h-full">
          <AIConversationContent>
            {transcript.map((message, index) => (
              <AIMessage
                from={message.role}
                key={`${message.role}-${index}-${message.text}`}
              >
                <AIMessageContent>{message.text}</AIMessageContent>
              </AIMessage>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      ) : (
        <div className="flex flex-1 h-full flex-col items-center justify-center gap-y-4">
          <div className="flex items-center justify-center rounded-full border bg-white p-3">
            <MicIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Transcript will appear here</p>
        </div>
      )}
      <div className="border-t bg-background p-4">
        <div className="flex flex-col items-center gap-y-4">
          {isConnected && (
            <div className="flex items-center gap-x-2">
              <div className={cn(
                "size-4 rounded-full",
                isSpeaking ? "animate-pulse bg-red-500" : "bg-green-500"
              )} />
              <span className="text-muted-foreground text-sm">
                {isSpeaking ? "Assistant Speaking..." : "Listening..."}
              </span>
            </div>
          )}
          <div className="flex w-full justify-center">
            {isConnected || isConnecting ? (
              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                onClick={() => endCall()}
              >
                <MicOffIcon />
                {isConnected ? "End call" : "Cancel"}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={() => startCall()}
              >
                <MicIcon />
                Start call
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}