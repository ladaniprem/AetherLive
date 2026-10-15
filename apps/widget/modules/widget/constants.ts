export const WIDGET_SCREENS = [
  "error",
  "loading",
  "selection",
  "voice",
  "auth",
  "inbox",
  "chat",
  "contact",
  "paywall",
] as const;

export const CONTACT_SESSION_KEY = "AetherLive_contact_session";

/**
 * Last organization this browser opened a chat with. The widget is normally
 * reached through the embed snippet (which always passes `?organizationId`),
 * but opening the widget URL directly for debugging should not dead-end on
 * "missing organizationId" — it reuses the last org that worked.
 */
export const LAST_ORGANIZATION_KEY = "AetherLive_last_organization_id";
