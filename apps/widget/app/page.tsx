"use client";

import { use, useEffect, useState } from "react";
import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { LAST_ORGANIZATION_KEY } from "@/modules/widget/constants";

interface Props {
  searchParams: Promise<{
    organizationId?: string;
  }>
};

// The embed snippet always passes ?organizationId, so this only fires when
// someone opens the widget URL directly (local debugging, a shared link).
// Reuse the last org that worked rather than showing a dead end.
const readLastOrganization = (): string | null => {
  try {
    const value = window.localStorage.getItem(LAST_ORGANIZATION_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
};

const Page = ({ searchParams }: Props) => {
  const { organizationId } = use(searchParams);
  const [fallback, setFallback] = useState<string | null>(null);
  const [checked, setChecked] = useState(Boolean(organizationId));

  useEffect(() => {
    if (organizationId) {
      try {
        window.localStorage.setItem(LAST_ORGANIZATION_KEY, organizationId);
      } catch {
        // private mode / storage disabled — the URL still works
      }
      return;
    }

    setFallback(readLastOrganization());
    setChecked(true);
  }, [organizationId]);

  if (!organizationId && !checked) {
    return null;
  }

  const resolved = organizationId ?? fallback;

  if (!resolved) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Missing <code>organizationId</code>. Copy the embed snippet from
          Dashboard → Integrations — it includes your organization ID.
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Or add <code>?organizationId=org_...</code> to this URL.
        </p>
      </div>
    );
  }

  return (
    <WidgetView organizationId={resolved} />
  );
};

export default Page;
