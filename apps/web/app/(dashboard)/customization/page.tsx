import { SubscriptionGuard } from "@/modules/billing/ui/components/subscription-guard";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

const Page = () => {
  return (
    <SubscriptionGuard feature="widgetCustomization">
      <CustomizationView />
    </SubscriptionGuard>
  );
};

export default Page;
