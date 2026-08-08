# MSTRMND Connector Standard

Connectors expose company systems and external services to governed workflows and agents.

## Required Documentation

Each connector should define:

- system and owner;
- business purpose;
- authentication method;
- supported resources and actions;
- read, write, publish, delete, and financial permissions;
- data classification and retention;
- rate limits, costs, and quotas;
- schemas and validation rules;
- idempotency behavior;
- error and retry behavior;
- audit and logging requirements;
- sandbox or test environment;
- emergency revocation procedure.

## Permission Model

Access should be granted by capability and resource scope, not by broad account-level convenience.

Separate credentials or approval policies should be used for:

- reading data;
- creating drafts;
- sending or publishing;
- modifying records;
- deleting information;
- initiating financial transactions;
- changing permissions or configuration.

## Integration Principles

1. Prefer stable, documented APIs and contracts.
2. Use MCP where it improves interoperability without weakening security.
3. Treat browser automation as a fallback when a reliable API is unavailable.
4. Validate all inputs and outputs at the connector boundary.
5. Design write operations to be idempotent where possible.
6. Preserve source identifiers and timestamps.
7. Surface partial failure rather than claiming complete success.
8. Never expose credentials in prompts, logs, or generated content.

## Initial Connector Registry

Priority connectors include:

- Gmail and email providers;
- Google Calendar and contacts;
- Slack and team communication;
- GitHub and software delivery systems;
- HubSpot and other CRMs;
- Stripe and commerce platforms;
- Supabase and company databases;
- Vercel and deployment infrastructure;
- Google Drive, Docs, Sheets, and Slides;
- Notion and knowledge systems;
- Adobe, Canva, Runway, and media platforms;
- telephony and voice-agent providers;
- internal company APIs and databases.

Each deployed connector should have its own implementation-specific file based on this standard.
