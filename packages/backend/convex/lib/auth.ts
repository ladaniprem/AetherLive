import { UserIdentity } from "convex/server";

// Clerk session tokens expose the active organization as `org_id` (token v1)
// or a compact `o` object (token v2). A camelCase `orgId` claim only exists
// if it was manually mapped in Clerk Dashboard -> Sessions -> Claims.
export const getOrganizationId = (
    identity: UserIdentity,
): string | undefined => {
    return (
        (identity.orgId as string | undefined) ??
        (identity.org_id as string | undefined) ??
        (identity.o as { id?: string } | undefined)?.id
    );
};
