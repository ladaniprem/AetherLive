import { SubscriptionGuard } from "@/modules/billing/ui/components/subscription-guard";
import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

const Layout = ({
  children
}: { children: React.ReactNode; }) => {
  return (
    <SubscriptionGuard feature="aiCustomerSupport">
      <ConversationsLayout>{children}</ConversationsLayout>
    </SubscriptionGuard>
  );
};

export default Layout;
