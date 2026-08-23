import { SubscriptionGuard } from "@/modules/billing/ui/components/subscription-guard";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

const Page = () => {
  return (
    <SubscriptionGuard feature="aiVoiceAgent">
      <VapiView />
    </SubscriptionGuard>
  );
};

export default Page;
