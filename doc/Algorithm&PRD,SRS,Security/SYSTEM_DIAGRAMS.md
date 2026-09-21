# AetherLive System Diagrams

This document contains diagram source for the required design views. The project is implemented with TypeScript/Next.js rather than C, C++, Java, or Python, so the object-oriented set is used as the primary design view. A structured design section is also included for flowchart, structure chart, and data flow coverage.

## 1. ER Diagram

```mermaid
erDiagram
    USERS {
        string name
    }

    CONTACT_SESSIONS {
        string name
        string email
        string organizationId
        id conversationId
        object metadata
    }

    CONVERSATIONS {
        string status
        string threadId
        id contactSessionId
        string organizationId
    }

    FILES {
        string name
        string type
        number size
        id storageId
        string category
        string organizationId
    }

    WIDGET_SETTINGS {
        string organizationId
        string greetMessage
        object defaultSuggestions
        object vapiSettings
    }

    PLUGINS {
        string service
        string organizationId
        boolean enabled
        any config
    }

    SECRETS {
        string service
        string organizationId
        any value
    }

    RATE_LIMITS {
        string key
        number window
        number count
        number expiresAt
    }

    CSRF_TOKENS {
        string token
        string organizationId
        number expiresAt
    }

    SUBSCRIPTIONS {
        string organizationId
        string plan
        string status
        string stripeSubscriptionId
        number currentPeriodEnd
        number updatedAt
    }

    CONTACT_SESSIONS ||--o| CONVERSATIONS : starts
    CONVERSATIONS }o--|| CONTACT_SESSIONS : belongs_to
    CONTACT_SESSIONS }o--|| WIDGET_SETTINGS : organization_uses
    FILES }o--|| WIDGET_SETTINGS : organization_knowledge
    PLUGINS }o--|| SECRETS : uses
    SUBSCRIPTIONS ||--o{ FILES : gates
    SUBSCRIPTIONS ||--o{ PLUGINS : gates
```

## 2. Sequence Diagram

### Visitor Starts an AI Support Conversation

```mermaid
sequenceDiagram
    actor Visitor
    participant Host as Customer Website
    participant Embed as Embed SDK
    participant Widget as Widget App
    participant Convex as Convex Backend
    participant Agent as AI Agent
    participant Dashboard as Agent Dashboard

    Visitor->>Host: Opens website
    Host->>Embed: Loads script with organizationId
    Embed->>Widget: Opens iframe widget
    Widget->>Convex: Create/reuse contact session
    Convex-->>Widget: Session and widget settings
    Visitor->>Widget: Sends message
    Widget->>Convex: Create conversation/message
    Convex->>Agent: Request AI response
    Agent-->>Convex: Generated response
    Convex-->>Widget: Realtime message update
    alt AI cannot resolve
        Convex->>Convex: Mark conversation escalated
        Convex-->>Dashboard: Realtime inbox update
        Dashboard->>Convex: Human agent replies
        Convex-->>Widget: Realtime agent reply
    end
```

## 3. Use Case Diagram

```mermaid
flowchart LR
    Visitor([Visitor])
    Agent([Support Agent])
    Admin([Administrator])
    Clerk([Clerk])
    Vapi([Vapi])
    AI([AI Agent])

    subgraph System[AetherLive]
        UC1((Start chat))
        UC2((Receive AI response))
        UC3((Escalate issue))
        UC4((View conversations))
        UC5((Reply to customer))
        UC6((Upload knowledge file))
        UC7((Customize widget))
        UC8((Manage integrations))
        UC9((Manage billing))
        UC10((Authenticate user))
        UC11((Start voice call))
    end

    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3
    Visitor --> UC11
    Agent --> UC4
    Agent --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Agent --> UC10
    Admin --> UC10
    Clerk --> UC10
    AI --> UC2
    Vapi --> UC11
```

## 4. Object Diagram

```mermaid
classDiagram
    class Org_aetherlive {
        organizationId = "org_123"
    }
    class ContactSession_jane {
        name = "Jane"
        email = "jane@example.com"
        timezone = "Asia/Calcutta"
    }
    class Conversation_support {
        status = "unresolved"
        threadId = "thread_abc"
    }
    class WidgetSettings_org {
        greetMessage = "How can we help?"
        suggestion1 = "Pricing"
        assistantId = "asst_001"
    }
    class File_faq {
        name = "faq.pdf"
        category = "FAQ"
    }
    class Plugin_vapi {
        service = "vapi"
        enabled = true
    }
    class Subscription_pro {
        plan = "pro"
        status = "active"
    }

    Org_aetherlive --> ContactSession_jane
    ContactSession_jane --> Conversation_support
    Org_aetherlive --> WidgetSettings_org
    Org_aetherlive --> File_faq
    Org_aetherlive --> Plugin_vapi
    Org_aetherlive --> Subscription_pro
```

## 5. Class Diagram

```mermaid
classDiagram
    class EmbedSDK {
        +init(config)
        +show()
        +hide()
        +destroy()
    }

    class WidgetApp {
        +loadSettings()
        +createSession()
        +sendMessage()
        +startVoiceCall()
    }

    class DashboardApp {
        +listConversations()
        +openConversation()
        +uploadFile()
        +updateWidgetSettings()
        +manageBilling()
    }

    class ConvexBackend {
        +publicContactSessions()
        +publicMessages()
        +privateConversations()
        +privateFiles()
        +privatePlugins()
    }

    class AuthService {
        +getOrganizationId()
        +requireOrganization()
    }

    class SubscriptionService {
        +getSubscription()
        +requireFeature()
    }

    class AIService {
        +generateResponse()
        +escalateIfNeeded()
    }

    class VoiceService {
        +connectVapi()
        +listAssistants()
        +listPhoneNumbers()
    }

    class ContactSession
    class Conversation
    class File
    class WidgetSettings
    class Plugin
    class Subscription

    EmbedSDK --> WidgetApp
    WidgetApp --> ConvexBackend
    DashboardApp --> ConvexBackend
    ConvexBackend --> AuthService
    ConvexBackend --> SubscriptionService
    ConvexBackend --> AIService
    ConvexBackend --> VoiceService
    ConvexBackend --> ContactSession
    ConvexBackend --> Conversation
    ConvexBackend --> File
    ConvexBackend --> WidgetSettings
    ConvexBackend --> Plugin
    ConvexBackend --> Subscription
```

## 6. Activity Diagram

```mermaid
flowchart TD
    A([Visitor opens website]) --> B[Embed SDK loads]
    B --> C[Display widget button]
    C --> D{Visitor opens widget?}
    D -- No --> C
    D -- Yes --> E[Load organization widget settings]
    E --> F[Create or reuse contact session]
    F --> G[Visitor enters message]
    G --> H[Create conversation and message]
    H --> I[AI agent generates response]
    I --> J{Issue resolved?}
    J -- Yes --> K[Show AI response]
    K --> L([Conversation continues or ends])
    J -- No --> M[Mark conversation escalated]
    M --> N[Show in dashboard inbox]
    N --> O[Support agent replies]
    O --> P[Visitor receives realtime reply]
    P --> L
```

## 7. Flowchart / Structure Chart

### Conversation Handling Flowchart

```mermaid
flowchart TD
    Start([Start])
    Validate[Validate organization and input]
    RateLimit[Check rate limit]
    Session[Find or create contact session]
    Conversation[Find or create conversation]
    Store[Store visitor message]
    AI[Generate AI response]
    Decision{AI confidence / resolution sufficient?}
    Reply[Store AI reply]
    Escalate[Set status to escalated]
    Notify[Notify dashboard through realtime update]
    End([End])

    Start --> Validate --> RateLimit --> Session --> Conversation --> Store --> AI --> Decision
    Decision -- Yes --> Reply --> End
    Decision -- No --> Escalate --> Notify --> End
```

### Structure Chart

```mermaid
flowchart TD
    Root[AetherLive System]
    Web[Dashboard App]
    Widget[Widget App]
    Embed[Embed SDK]
    Backend[Convex Backend]
    Services[External Services]

    Root --> Web
    Root --> Widget
    Root --> Embed
    Root --> Backend
    Root --> Services

    Web --> Auth[Auth and Organization Guard]
    Web --> Conversations[Conversation Management]
    Web --> Files[Knowledge Base Files]
    Web --> Customization[Widget Customization]
    Web --> Billing[Billing]
    Web --> Plugins[Plugin Management]

    Widget --> Screens[Widget Screens]
    Widget --> Chat[Chat Flow]
    Widget --> Voice[Voice Flow]
    Widget --> SessionState[Session State]

    Embed --> Loader[Script Loader]
    Embed --> Iframe[Iframe Manager]
    Embed --> PublicAPI[Global Widget API]

    Backend --> PublicAPIBackend[Public Widget API]
    Backend --> PrivateAPIBackend[Private Dashboard API]
    Backend --> Storage[File Storage]
    Backend --> Realtime[Realtime Sync]
    Backend --> Security[Rate Limit and CSRF]

    Services --> Clerk[Clerk]
    Services --> OpenAI[OpenAI / Convex Agent]
    Services --> Vapi[Vapi]
    Services --> Sentry[Sentry]
```

## 8. Data Flow Diagram

```mermaid
flowchart LR
    Visitor[Visitor]
    Admin[Admin / Agent]
    Website[Customer Website]
    Embed[Embed SDK]
    Widget[Widget App]
    Dashboard[Dashboard App]
    Backend[Convex Backend]
    DB[(Convex Database)]
    Storage[(Convex Storage)]
    Clerk[Clerk]
    AI[AI Agent]
    Vapi[Vapi]
    Sentry[Sentry]

    Visitor --> Website
    Website --> Embed
    Embed --> Widget
    Visitor --> Widget
    Widget --> Backend
    Backend --> DB
    Backend --> Storage
    Backend --> AI
    Widget --> Vapi

    Admin --> Dashboard
    Dashboard --> Clerk
    Clerk --> Dashboard
    Dashboard --> Backend
    Backend --> Dashboard
    Backend --> Sentry
    Dashboard --> Sentry
    Widget --> Sentry
```

