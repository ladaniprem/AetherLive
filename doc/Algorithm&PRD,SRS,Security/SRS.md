# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the functional and non-functional requirements for AetherLive, an AI-powered customer support platform. The document is intended for developers, testers, project evaluators, administrators, and future maintainers.

### 1.2 Scope

AetherLive provides a web dashboard, embeddable customer support widget, embed SDK, and Convex backend for real-time AI-assisted customer support. Businesses can install the widget on their websites, configure support behavior, upload knowledge base files, connect voice support, and manage customer conversations from a unified dashboard.

### 1.3 Product Overview

The system has four primary parts:

- Web dashboard for organization users, support agents, and administrators.
- Widget app for website visitors.
- Embed SDK for loading the widget through a script tag.
- Convex backend for data, authentication integration, file storage, real-time messages, subscriptions, and plugin configuration.

### 1.4 Definitions

| Term | Meaning |
| --- | --- |
| Organization | A business account managed through Clerk organizations. |
| Contact Session | A visitor identity and browser/device context captured by the widget. |
| Conversation | A support thread between a visitor, AI agent, and human agent. |
| Widget | Customer-facing chat/voice support interface embedded on a website. |
| Knowledge Base | Uploaded files used to support AI/customer-service responses. |
| Vapi | Voice AI service integrated as an optional plugin. |
| Convex | Backend platform used for database, functions, storage, and real-time updates. |

## 2. Overall Description

### 2.1 Product Perspective

AetherLive is a SaaS-style customer support platform. It integrates with external systems including Clerk for authentication and billing, Convex for backend services, OpenAI/Convex Agent for AI support, Vapi for voice calls, and Sentry for monitoring.

### 2.2 User Classes

| User Class | Description |
| --- | --- |
| Visitor | Anonymous website user who interacts with the support widget. |
| Support Agent | Authenticated organization user who views and replies to conversations. |
| Administrator | Organization user who manages settings, files, billing, and integrations. |
| System Services | External services such as Clerk, Convex, Vapi, OpenAI, and Sentry. |

### 2.3 Operating Environment

- Browser-based dashboard built with Next.js and TypeScript.
- Browser-based widget embedded through an iframe.
- Vanilla TypeScript embed SDK built as an IIFE.
- Convex serverless backend.
- Clerk authentication and organization management.
- pnpm/Turborepo monorepo development environment.

### 2.4 Assumptions and Dependencies

- Organizations are managed through Clerk.
- Convex deployment URL is configured in environment variables.
- Widget installation requires a valid organization identifier.
- Voice support depends on valid Vapi configuration.
- AI responses depend on configured AI services and available knowledge base data.

## 3. Functional Requirements

### 3.1 Authentication and Organization Management

| ID | Requirement |
| --- | --- |
| FR-001 | The system shall allow users to sign in and sign up through Clerk. |
| FR-002 | The system shall require authenticated users to select or create an organization before using dashboard features. |
| FR-003 | The system shall isolate dashboard data by organization. |
| FR-004 | The system shall prevent unauthenticated users from accessing protected dashboard routes. |

### 3.2 Widget and Embed SDK

| ID | Requirement |
| --- | --- |
| FR-005 | The system shall provide an embeddable script that displays a floating support widget. |
| FR-006 | The widget shall open inside an iframe panel. |
| FR-007 | The widget shall support show, hide, initialize, and destroy operations through a global API. |
| FR-008 | The widget shall create or reuse anonymous contact sessions. |
| FR-009 | The widget shall capture visitor metadata such as browser, device, language, timezone, referrer, and current URL. |

### 3.3 Conversations and Messages

| ID | Requirement |
| --- | --- |
| FR-010 | Visitors shall be able to start support conversations from the widget. |
| FR-011 | The system shall store conversations with status values of unresolved, resolved, or escalated. |
| FR-012 | Support agents shall be able to view organization conversations in the dashboard. |
| FR-013 | Support agents shall be able to open a conversation and inspect its associated contact session. |
| FR-014 | The system shall support real-time updates for conversation and message changes. |
| FR-015 | The system shall allow conversation filtering by status. |

### 3.4 AI Support

| ID | Requirement |
| --- | --- |
| FR-016 | The system shall support AI-assisted responses for customer messages. |
| FR-017 | The AI agent should use available organization knowledge base data when generating answers. |
| FR-018 | The system shall allow unresolved issues to be escalated for human review. |

### 3.5 Knowledge Base Files

| ID | Requirement |
| --- | --- |
| FR-019 | Administrators shall be able to upload supported knowledge base files. |
| FR-020 | The system shall store file name, type, size, category, storage identifier, and organization identifier. |
| FR-021 | Administrators shall be able to list and delete organization files. |

### 3.6 Widget Customization

| ID | Requirement |
| --- | --- |
| FR-022 | Administrators shall be able to configure the widget greeting message. |
| FR-023 | Administrators shall be able to configure default suggestion prompts. |
| FR-024 | Administrators shall be able to configure voice settings such as Vapi assistant and phone number. |

### 3.7 Integrations and Plugins

| ID | Requirement |
| --- | --- |
| FR-025 | Administrators shall be able to view integration setup instructions. |
| FR-026 | Administrators shall be able to enable or disable supported plugins. |
| FR-027 | The system shall store plugin configuration per organization. |
| FR-028 | The system shall store service secrets securely through backend-controlled data access. |

### 3.8 Billing and Subscriptions

| ID | Requirement |
| --- | --- |
| FR-029 | The system shall track subscription plan and status for each organization. |
| FR-030 | The system shall support free, pro, and enterprise plans. |
| FR-031 | The system shall gate premium capabilities based on subscription features. |

### 3.9 Security and Reliability

| ID | Requirement |
| --- | --- |
| FR-032 | The system shall apply rate limiting to sensitive public endpoints. |
| FR-033 | The system shall support CSRF token validation for protected operations. |
| FR-034 | The system shall report runtime errors and health information through observability tooling. |

## 4. Non-Functional Requirements

| ID | Requirement |
| --- | --- |
| NFR-001 | The widget floating action button should become visible within 2 seconds on normal network conditions. |
| NFR-002 | AI first response should complete within 3 seconds when service dependencies are healthy. |
| NFR-003 | Dashboard pages should load within 1.5 seconds for common workflows. |
| NFR-004 | The embed SDK should remain lightweight and framework-independent. |
| NFR-005 | The system shall protect organization data from cross-tenant access. |
| NFR-006 | The system shall use TypeScript for maintainability and static checking. |
| NFR-007 | The system shall support modern browsers including Chrome, Firefox, Safari, and Edge. |
| NFR-008 | The UI should remain usable on desktop and mobile viewports. |
| NFR-009 | The system should provide automated tests for critical backend, embed, and UI behavior. |
| NFR-010 | Sensitive credentials shall not be exposed to client-side code. |

## 5. Data Requirements

| Entity | Main Attributes |
| --- | --- |
| User | name |
| ContactSession | name, email, organizationId, conversationId, metadata |
| Conversation | status, threadId, contactSessionId, organizationId |
| File | name, type, size, storageId, category, organizationId |
| WidgetSettings | organizationId, greetMessage, defaultSuggestions, vapiSettings |
| Plugin | service, organizationId, enabled, config |
| Secret | service, organizationId, value |
| RateLimit | key, window, count, expiresAt |
| CsrfToken | token, organizationId, expiresAt |
| Subscription | organizationId, plan, status, stripeSubscriptionId, currentPeriodEnd, updatedAt |

## 6. External Interface Requirements

### 6.1 User Interfaces

- Landing page for product information.
- Authentication pages for sign-in, sign-up, and organization selection.
- Dashboard pages for conversations, files, customization, integrations, billing, plugins, and settings.
- Embedded widget screens for loading, contact/auth, selection, chat, inbox, voice, and error states.

### 6.2 Software Interfaces

| Interface | Purpose |
| --- | --- |
| Clerk | Authentication, organizations, billing UI, and JWT identity. |
| Convex | Database, storage, public/private functions, and real-time sync. |
| OpenAI/Convex Agent | AI response generation and thread handling. |
| Vapi | Voice assistant, phone numbers, and voice calls. |
| Sentry | Error tracking and monitoring. |

## 7. Use Case Summary

| Use Case | Primary Actor | Result |
| --- | --- | --- |
| Install widget | Administrator | Embed script is copied and added to a website. |
| Start chat | Visitor | Contact session and conversation are created. |
| Receive AI answer | Visitor | Visitor receives an instant automated response. |
| Escalate conversation | Visitor or AI Agent | Conversation appears for human review. |
| Reply to customer | Support Agent | Agent response updates the visitor thread. |
| Upload file | Administrator | Knowledge base file is stored for organization use. |
| Customize widget | Administrator | Widget greeting, suggestions, and voice settings are updated. |
| Connect voice plugin | Administrator | Vapi integration is enabled for the organization. |
| Manage billing | Administrator | Subscription plan/status is viewed or changed. |

## 8. Acceptance Criteria

- A new organization user can sign in, select an organization, and access the dashboard.
- A valid embed script loads the widget on a host page.
- A visitor can start a support conversation without signing in.
- Conversation data is stored with correct organization and contact session references.
- Dashboard users can list and open organization conversations.
- File upload stores metadata and links the file to the organization.
- Widget customization changes are persisted and retrievable.
- Premium features are restricted according to subscription state.
- Public endpoints enforce rate limiting and relevant security checks.