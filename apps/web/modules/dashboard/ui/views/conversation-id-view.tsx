// @ts-nocheck
"use client";

import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon, EraserIcon, MicIcon, MicOffIcon, MoreHorizontalIcon, Trash2Icon, Wand2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { useDashboardVapi } from "../../hooks/use-vapi";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { getChatBackgroundStyle } from "@workspace/ui/lib/appearance";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

// toUIMessages() returns UIMessage objects with `.text` + `.parts` —
// there is NO `.content` field, so reading `.content` renders empty bubbles.
const getMessageText = (message: any): string => {
  if (typeof message.text === "string" && message.text) return message.text;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text" && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
};

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">,
}) => {
  const router = useRouter();

  // The plan can lapse while the tab is open, which makes every call on this
  // page throw. One shared handler sends the operator to billing instead of
  // silently dropping their reply.
  const onPlanRequired = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? "");
    if (message.includes("PLAN_REQUIRED")) {
      router.push("/billing");
      return true;
    }
    return false;
  };

  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  // Voice call — same Vapi assistant + transcript experience as the widget
  const { organization } = useOrganization();
  // Org's saved chat background (Widget Customization) — same as the widget
  const widgetAppearance = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organization?.id ? { organizationId: organization.id } : "skip",
  );
  const voice = useDashboardVapi(organization?.id);
  const [showVoice, setShowVoice] = useState(false);

  // File a finished operator call into this chat as conversation messages.
  const saveTranscript = useMutation(api.public.messages.saveTranscript);
  const transcriptSavedRef = useRef(false);
  useEffect(() => {
    if (voice.isConnected || voice.isConnecting) {
      transcriptSavedRef.current = false;
    }
  }, [voice.isConnected, voice.isConnecting]);
  useEffect(() => {
    if (voice.isConnected || voice.isConnecting) return;
    if (transcriptSavedRef.current || voice.transcript.length === 0) return;
    const contactSessionId = conversation?.contactSessionId;
    if (!contactSessionId) return;
    transcriptSavedRef.current = true;
    saveTranscript({
      conversationId,
      contactSessionId,
      lines: voice.transcript.map((line) => ({
        role: line.role,
        text: line.text,
      })),
    }).catch((error) => {
      console.warn("[dashboard] saving call transcript failed:", error);
    });
  }, [voice.isConnected, voice.isConnecting, voice.transcript]);

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 10, }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any) as any,
    defaultValues: {
      message: "",
    },
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const handleEnhanceResponse = async () => {
    setIsEnhancing(true);
    const currentValue = form.getValues("message");

    try {
      const response = await enhanceResponse({ prompt: currentValue });

      form.setValue("message", response);
    } catch (error) {
      if (onPlanRequired(error)) return;
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  }

  const createMessage = useMutation(api.private.messages.create);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });

      form.reset();
    } catch (error) {
      if (onPlanRequired(error)) return;
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const [isClearing, setIsClearing] = useState(false);
  const clearMessages = useMutation(api.private.conversations.clearMessages);
  const handleClear = async () => {
    if (!conversation) return;
    if (!window.confirm("Clear all messages in this chat? The conversation stays open.")) return;
    setIsClearing(true);
    try {
      await clearMessages({ conversationId });
      toast.success("Messages cleared");
    } catch (error) {
      if (onPlanRequired(error)) return;
      toast.error("Failed to clear messages");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteConversation = useMutation(api.private.conversations.remove);
  const handleDelete = async () => {
    if (!conversation) return;
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteConversation({ conversationId });
      toast.success("Conversation deleted");
      router.push("/conversations");
    } catch (error) {
      if (onPlanRequired(error)) return;
      toast.error("Failed to delete conversation");
      console.error(error);
      setIsDeleting(false);
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
  const handleToggleStatus = async () => {
    if (!conversation) {
      return;
    }

    setIsUpdatingStatus(true);

    let newStatus: "unresolved" | "resolved" | "escalated";

    // Cycle through states: unresolved -> escalated -> resolved -> unresolved
    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved"
    } else {
      newStatus = "unresolved"
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (conversation === undefined || messages.status === "LoadingFirstPage") {
    return <ConversationIdViewLoading />
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-muted">
      <header className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-b bg-background p-2.5">
        <Button
          className="mr-auto md:hidden"
          onClick={() => router.push("/conversations")}
          size="icon"
          variant="ghost"
          title="Back to conversations"
        >
          <ArrowLeftIcon />
        </Button>
        {voice.canCall && (
          <Button
            onClick={() => setShowVoice((v) => !v)}
            size="sm"
            variant={showVoice ? "default" : "outline"}
          >
            {showVoice ? <MicOffIcon /> : <MicIcon />}
            Voice call
          </Button>
        )}
        {!!conversation && (
          <>
            <Button
              disabled={isClearing}
              onClick={handleClear}
              size="icon"
              variant="ghost"
              title="Clear messages (keep chat)"
            >
              <EraserIcon />
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              size="icon"
              variant="ghost"
              title="Delete entire conversation"
            >
              <Trash2Icon className="text-destructive" />
            </Button>
            <ConversationStatusButton
              onClick={handleToggleStatus}
              status={conversation.status}
              disabled={isUpdatingStatus}
              loading={isUpdatingStatus}
            />
          </>
        )}
      </header>
      {showVoice && voice.canCall && (
        <div className="flex shrink-0 flex-col gap-3 border-b bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-x-2">
              <div className={cn(
                "size-3 rounded-full",
                voice.isConnected
                  ? voice.isSpeaking
                    ? "animate-pulse bg-red-500"
                    : "bg-green-500"
                  : "bg-muted-foreground/30"
              )} />
              <span className="text-muted-foreground text-sm">
                {voice.isConnected
                  ? voice.isSpeaking
                    ? "Assistant speaking..."
                    : "Listening..."
                  : voice.isConnecting
                    ? "Connecting..."
                    : "Voice call with customer"}
              </span>
            </div>
            {voice.isConnected || voice.isConnecting ? (
              <Button onClick={voice.endCall} size="sm" variant="destructive">
                <MicOffIcon />
                {voice.isConnected ? "End call" : "Cancel"}
              </Button>
            ) : (
              <Button onClick={voice.startCall} size="sm">
                <MicIcon />
                Start call
              </Button>
            )}
          </div>
          {voice.transcript.length > 0 && (
            <div className="flex max-h-48 min-h-0 flex-col gap-2 overflow-y-auto rounded-lg border bg-muted p-3">
              {voice.transcript.map((line, index) => (
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg border px-2.5 py-1.5 text-sm",
                    line.role === "assistant"
                      ? "bg-background text-foreground"
                      : "ml-auto border-transparent bg-primary text-primary-foreground",
                  )}
                  key={`${line.role}-${index}-${line.text}`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <AIConversation
        className="min-h-0 flex-1 overflow-y-auto"
        style={getChatBackgroundStyle(widgetAppearance?.chatBackground)}
      >
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
            // In reverse, because we are watching from "assistant" prespective
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
              className="min-w-0"
            >
              <AIMessageContent className="min-w-0 overflow-hidden">
                  <AIResponse>
                    {getMessageText(message)}
                  </AIResponse>
                </AIMessageContent>
              {message.role === "user" && (
                <DicebearAvatar
                  seed={conversation?.contactSessionId ?? "user"}
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      
      <div className="shrink-0 border-t bg-background p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={
                    conversation?.status === "resolved" ||
                    form.formState.isSubmitting ||
                    isEnhancing
                  }
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved"
                      : "Type your response as an operator..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  onClick={handleEnhanceResponse}
                  disabled={
                    conversation?.status === "resolved" || 
                    isEnhancing || 
                    !form.formState.isValid
                  }
                >
                  <Wand2Icon />
                  {isEnhancing ? "Enhancing..." : "Enhance"}
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};

export const ConversationIdViewLoading = () => {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-muted">
      <header className="flex shrink-0 items-center justify-between border-b bg-background p-2.5">
        <Button disabled size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="min-h-0 flex-1">
        <AIConversationContent>
          {Array.from({ length: 8 }, (_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[index % widths.length];

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={index}
              >
                <Skeleton className={`h-9 ${width} rounded-lg bg-neutral-200`} />
                <Skeleton className="size-8 rounded-full bg-neutral-200" />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>

      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            disabled
            placeholder="Type your response as an operator..."
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit disabled status="ready" />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};
