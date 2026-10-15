"use client";
import { useAtomValue, useSetAtom } from "jotai";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { WidgetFooter } from "../components/widget-footer";
import { Button } from "@workspace/ui/components/button";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  });

  const deleteConversation = useMutation(api.public.conversations.remove);
  const handleDelete = async (conversationId: string) => {
    if (!contactSessionId) return;
    if (!window.confirm("Delete this chat?")) return;
    try {
      await deleteConversation({ conversationId, contactSessionId });
    } catch (error) {
      console.error("[widget] delete conversation failed:", error);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant="transparent"
            size="icon"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
        {conversations?.results.length > 0 &&
          conversations?.results.map((conversation) => (
            <div className="flex w-full items-stretch gap-2" key={conversation._id}>
              <Button
                className="h-20 min-w-0 flex-1 justify-between"
                onClick={() => {
                  setConversationId(conversation._id);
                  setScreen("chat");
                }}
                variant="outline"
              >
                <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <p className="text-muted-foreground text-xs">Chat</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(conversation._creationTime))}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <p className="truncate text-sm">
                      {(conversation as any).lastMessage?.text ?? ""}
                    </p>
                    <ConversationStatusIcon status={conversation.status} className="shrink-0" />
                  </div>
                </div>
              </Button>
              <Button
                aria-label="Delete chat"
                className="shrink-0 px-3"
                onClick={() => handleDelete(conversation._id)}
                size="icon"
                variant="outline"
              >
                <Trash2Icon className="size-4 text-destructive" />
              </Button>
            </div>
          ))
        }
        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
        />
      </div>
      <WidgetFooter />
    </>
  );
};
