import { SubscriptionGuard } from "@/modules/billing/ui/components/subscription-guard";
import { FilesView } from "@/modules/files/ui/views/files-view";

const Page = () => {
  return (
    <SubscriptionGuard feature="knowledgeBase">
      <FilesView />
    </SubscriptionGuard>
  );
};

export default Page;
