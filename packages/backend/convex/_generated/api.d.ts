/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _csrf from "../_csrf.js";
import type * as _rateLimit from "../_rateLimit.js";
import type * as _saveFile from "../_saveFile.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_csrf from "../lib/csrf.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as lib_subscription from "../lib/subscription.js";
import type * as private_contactSessions from "../private/contactSessions.js";
import type * as private_conversations from "../private/conversations.js";
import type * as private_files from "../private/files.js";
import type * as private_messages from "../private/messages.js";
import type * as private_plugins from "../private/plugins.js";
import type * as private_secrets from "../private/secrets.js";
import type * as private_subscriptions from "../private/subscriptions.js";
import type * as private_vapi from "../private/vapi.js";
import type * as private_widgetSettings from "../private/widgetSettings.js";
import type * as public_agent from "../public/agent.js";
import type * as public_contactSessions from "../public/contactSessions.js";
import type * as public_conversations from "../public/conversations.js";
import type * as public_csrf from "../public/csrf.js";
import type * as public_messages from "../public/messages.js";
import type * as public_organizations from "../public/organizations.js";
import type * as public_plugins from "../public/plugins.js";
import type * as public_secrets from "../public/secrets.js";
import type * as public_widgetSettings from "../public/widgetSettings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _csrf: typeof _csrf;
  _rateLimit: typeof _rateLimit;
  _saveFile: typeof _saveFile;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/csrf": typeof lib_csrf;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/secrets": typeof lib_secrets;
  "lib/subscription": typeof lib_subscription;
  "private/contactSessions": typeof private_contactSessions;
  "private/conversations": typeof private_conversations;
  "private/files": typeof private_files;
  "private/messages": typeof private_messages;
  "private/plugins": typeof private_plugins;
  "private/secrets": typeof private_secrets;
  "private/subscriptions": typeof private_subscriptions;
  "private/vapi": typeof private_vapi;
  "private/widgetSettings": typeof private_widgetSettings;
  "public/agent": typeof public_agent;
  "public/contactSessions": typeof public_contactSessions;
  "public/conversations": typeof public_conversations;
  "public/csrf": typeof public_csrf;
  "public/messages": typeof public_messages;
  "public/organizations": typeof public_organizations;
  "public/plugins": typeof public_plugins;
  "public/secrets": typeof public_secrets;
  "public/widgetSettings": typeof public_widgetSettings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
