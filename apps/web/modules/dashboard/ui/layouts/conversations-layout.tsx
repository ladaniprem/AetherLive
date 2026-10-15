"use client";

import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { ConversationsPanel } from "../components/conversations-panel";

export const ConversationsLayout = ({
  children
}: { children: React.ReactNode; }) => {
  const pathname = usePathname();
  // Mobile: list and chat take turns full-screen.
  // Desktop (md+): classic side-by-side.
  const isList = pathname === "/conversations";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div className={cn(
        "h-full min-h-0 border-r bg-background",
        isList
          ? "w-full min-w-0 flex-1"
          : "hidden md:block md:w-[300px] md:shrink-0 xl:w-[340px]",
      )}>
        <ConversationsPanel />
      </div>
      <div className={cn(
        "h-full min-h-0 min-w-0 overflow-hidden",
        isList ? "hidden md:block md:min-w-0 md:flex-1" : "w-full flex-1",
      )}>
        {children}
      </div>
    </div>
  );
};
