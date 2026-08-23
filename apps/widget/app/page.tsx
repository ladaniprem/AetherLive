"use client";

import { use } from "react";

import { WidgetView } from "@/modules/widget/ui/views/widget-view";

const FALLBACK_ORG_ID = "org_31QtvqJKwhtvop04esLJMkmFouB";

interface Props {
  searchParams: Promise<{
    organizationId: string;
  }>
};

const Page = ({ searchParams }: Props) => {
  const { organizationId } = use(searchParams);
  const orgId = organizationId
    || process.env.NEXT_PUBLIC_DEFAULT_ORG_ID
    || FALLBACK_ORG_ID;

  return (
    <WidgetView organizationId={orgId} />
  );
};

export default Page;