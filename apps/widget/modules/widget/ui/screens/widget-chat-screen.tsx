"use client";
import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, EraserIcon, MenuIcon } from "lucide-react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { canChatAtom, contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, hasVapiSecretsAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Form, FormField } from "@workspace/ui/components/form";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
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
import { getChatBackgroundStyle } from "@workspace/ui/lib/appearance";
import { useEffect, useMemo, useRef, useState } from "react";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

// toUIMessages() returns UIMessage objects with `.text` + `.parts` —
// there is NO `.content` field.
const getMessageText = (message: any): string => {
  if (typeof message.text === "string" && message.text) return message.text;
  if (typeof message.content === "string" && message.content) return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text" && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
};

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  const suggestions = useMemo(() => {
    if (!widgetSettings) {
      return [];
    }

    return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
      return widgetSettings.defaultSuggestions[
        key as keyof typeof widgetSettings.defaultSuggestions
      ];
    });
  }, [widgetSettings]);

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        } 
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
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

  const canChat = useAtomValue(canChatAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const createMessage = useMutation(api.public.messages.create);
  const escalateConversation = useMutation(api.public.conversations.escalate);
  const triggerAgent = useAction(api.public.agent.respond);
  const triggerVapi = useAction(api.public.vapiChat.respond);
  // Same Vapi assistant as voice calls answers text chat when wired,
  // otherwise the built-in agent responds (orgs without Vapi keep working).
  const hasVapiSecrets = useAtomValue(hasVapiSecretsAtom);
  const useVapiChat =
    hasVapiSecrets && !!widgetSettings?.vapiSettings?.assistantId;
  // Vapi text chat needs a card on file (402 otherwise) — after the first
  // payment failure, skip Vapi and use the agent. Persisted per org so a
  // page reload doesn't retry the failing call; retried automatically
  // after 24h in case a card was added.
  const vapiBlockedKey = `aetherlive_vapi_blocked_${organizationId || "none"}`;
  const isVapiBlocked = () => {
    try {
      const raw = window.localStorage.getItem(vapiBlockedKey);
      if (!raw) return false;
      return Date.now() - Number(raw) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };
  const shouldUseVapi = () => useVapiChat && !isVapiBlocked();
  const noteVapiBlocked = (error: unknown) => {
    if (error instanceof Error && /402|payment|card on file/i.test(error.message)) {
      try {
        window.localStorage.setItem(vapiBlockedKey, String(Date.now()));
      } catch {
        // storage unavailable — fall back to agent for this attempt only
      }
    }
  };

  // The plan can lapse (or the widget can be embedded on an org that never
  // upgraded) while a chat is open. Every chat call re-checks entitlements
  // server-side, so a PLAN_REQUIRED here means "this org is not on Pro" —
  // route to the paywall instead of showing a dead input.
  const handleChatError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error ?? "");

    if (message.includes("PLAN_REQUIRED")) {
      setErrorMessage("Chat is not available on the free plan");
      setScreen("paywall");
      return true;
    }

    return false;
  };

  // Fresh empty chat: the assistant opens with a greeting (once per thread).
  const greetedThreadRef = useRef<string | null>(null);
  useEffect(() => {
    const threadId = conversation?.threadId;
    if (!threadId || !contactSessionId) return;
    if (messages.status === "LoadingFirstPage") return;
    if (greetedThreadRef.current === threadId) return;
    if ((messages.results ?? []).length > 0) {
      greetedThreadRef.current = threadId;
      return;
    }
    greetedThreadRef.current = threadId;
    baseCountRef.current = 0;
    setIsResponding(true);
    (async () => {
      // Vapi-first, agent-fallback — same order as onSubmit. A greeting that
      // only tried Vapi left the visitor staring at an empty chat, because
      // VAPI_NOT_CONFIGURED and 402 both throw.
      const sendGreeting = async () => {
        if (shouldUseVapi()) {
          try {
            await triggerVapi({ threadId, contactSessionId, greeting: true });
            return;
          } catch (error) {
            if (handleChatError(error)) throw error;
            noteVapiBlocked(error);
            console.warn(
              "[widget] Vapi greeting failed, falling back to agent:",
              error
            );
          }
        }

        // The agent needs `greeting` too: an empty thread has no turn to
        // reply to, so without it the fallback agent stays silent.
        await triggerAgent({ threadId, greeting: true });
      };

      try {
        await sendGreeting();
      } catch (error) {
        if (handleChatError(error)) return;
        setIsResponding(false);
        console.warn("[widget] greeting failed:", error);
      }
    })();
  }, [
    conversation?.threadId,
    contactSessionId,
    messages.status,
    useVapiChat,
  ]);

  // "AI is typing…" indicator — on after send, off when a NEW reply lands.
  const [isResponding, setIsResponding] = useState(false);
  const uiMessages = useMemo(
    () => toUIMessages(messages.results ?? []),
    [messages.results],
  );
  const assistantCount = uiMessages.filter((m) => m.role === "assistant").length;
  const baseCountRef = useRef(0);
  useEffect(() => {
    if (isResponding && assistantCount > baseCountRef.current) {
      setIsResponding(false);
    }
  }, [assistantCount, isResponding]);
  useEffect(() => {
    if (!isResponding) return;
    const t = setTimeout(() => setIsResponding(false), 90000);
    return () => clearTimeout(t);
  }, [isResponding]);

  // Visitor asks for a human (AI can't handle it) → escalate to operators.
  const wantsHuman = (text: string) =>
    /\b(human|real person|real agent|talk to (someone|agent|person|human|support)|customer support|support agent|call me|phone me)\b/i.test(
      text,
    );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId || !conversationId) {
      return;
    }

    if (canChat === false) {
      setErrorMessage("Chat is not available on the free plan");
      setScreen("paywall");
      return;
    }

    form.reset();

    try {
      await createMessage({
        threadId: conversation.threadId,
        prompt: values.message,
        contactSessionId,
      });
    } catch (error) {
      if (handleChatError(error)) return;
      setIsResponding(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
      setScreen("error");
      return;
    }

    baseCountRef.current = assistantCount;
    setIsResponding(true);

    if (wantsHuman(values.message)) {
      try {
        await escalateConversation({ conversationId, contactSessionId });
      } catch (error) {
        console.warn("[widget] escalate failed:", error);
      }
    }

    if (shouldUseVapi()) {
      try {
        await triggerVapi({
          threadId: conversation.threadId,
          contactSessionId,
        });
        return;
      } catch (error) {
        if (handleChatError(error)) return;
        noteVapiBlocked(error);
        console.warn("[widget] Vapi chat failed, falling back to agent:", error);
      }
    }

    // Vapi-first, agent-fallback: the agent also answers when the org has no
    // Vapi wiring at all. Awaited so a failure is visible instead of an
    // unhandled rejection that leaves the typing indicator spinning for 90s.
    try {
      await triggerAgent({ threadId: conversation.threadId, greeting: false });
    } catch (error) {
      if (handleChatError(error)) return;
      setIsResponding(false);
      setErrorMessage(
        error instanceof Error ? error.message : "AI reply failed"
      );
      setScreen("error");
    }
  };

  const clearMessages = useMutation(api.public.conversations.clearMessages);
  const handleClear = async () => {
    if (!conversationId || !contactSessionId) return;
    if (!window.confirm("Clear all messages? The chat stays open.")) return;
    try {
      await clearMessages({ conversationId, contactSessionId });
    } catch (error) {
      console.error("[widget] clear messages failed:", error);
    }
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            onClick={onBack}
            size="icon"
            variant="transparent"
          >
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <div className="flex items-center gap-x-1">
          <Button
            onClick={handleClear}
            size="icon"
            title="Clear messages"
            variant="transparent"
          >
            <EraserIcon />
          </Button>
          <Button
            size="icon"
            variant="transparent"
          >
            <MenuIcon />
          </Button>
        </div>
      </WidgetHeader>
      <AIConversation
        className="min-h-0 flex-1 overflow-y-auto"
        style={getChatBackgroundStyle(widgetSettings?.chatBackground)}
      >
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {uiMessages?.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{getMessageText(message)}</AIResponse>
                </AIMessageContent>
                {message.role === "assistant" && (
                  <DicebearAvatar
                    imageUrl="/logo.svg"
                    seed="assistant"
                    size={32}
                  />
                )}
              </AIMessage>
            )
          })}
          {isResponding && (
            <AIMessage from="assistant" key="typing-indicator">
              <AIMessageContent>
                <span className="flex items-center gap-1 py-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-current" />
                  <span className="size-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
                </span>
              </AIMessageContent>
              <DicebearAvatar
                imageUrl="/logo.svg"
                seed="assistant"
                size={32}
              />
            </AIMessage>
          )}
        </AIConversationContent>
      </AIConversation>
      {uiMessages?.length === 1 && (
        <AISuggestions className="flex w-full flex-col items-end p-2">
          {suggestions.map((suggestion) => {
            if (!suggestion) {
              return null;
            }

            return (
              <AISuggestion
                key={suggestion}
                onClick={() => {
                  form.setValue("message", suggestion, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  form.handleSubmit(onSubmit)();
                }}
                suggestion={suggestion}
              />
            )
          })}
        </AISuggestions>
      )}
      <Form {...form}>
          <AIInput
            className="rounded-none border-x-0 border-b-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved"}
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools />
              <AIInputSubmit
                disabled={conversation?.status === "resolved" || !form.formState.isValid}
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
      </Form>
    </>
  );
};
