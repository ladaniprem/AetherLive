import { ContactPanel } from "../components/contact-panel";

export const ConversationIdLayout = ({ children }: { children: React.ReactNode; }) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
      </div>
      <div className="hidden h-full w-[300px] shrink-0 overflow-y-auto border-l bg-background lg:block xl:w-[340px]">
        <ContactPanel />
      </div>
    </div>
  );
};
