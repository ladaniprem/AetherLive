import { SubscriptionGuard } from "@/modules/billing/ui/components/subscription-guard";
import { IntegrationsView } from "@/modules/integrations/ui/views/integrations-view";

const Page = () => {
  return (
    <SubscriptionGuard feature="integrations">
      <IntegrationsView />
    </SubscriptionGuard>
  );
};

export default Page;
