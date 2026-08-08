# MSTRMND Agent Specification

Every MSTRMND agent should be defined as a governed operating component rather than an open-ended persona.

## Required Fields

### Identity

- name;
- version;
- owner;
- operating domain;
- deployment environment.

### Purpose

A concise description of the business outcome the agent exists to support.

### Scope

Explicitly define:

- actions the agent may take;
- actions it may recommend but not take;
- actions that are prohibited;
- users, customers, teams, or systems it may serve.

### Inputs

Specify accepted inputs, required context, source systems, freshness requirements, and validation rules.

### Outputs

Define the expected output schema, delivery surface, quality requirements, and downstream consumers.

### Skills

List the approved skills the agent may invoke. Agents should compose skills rather than embed every procedure in one system prompt.

### Tools and Permissions

For each tool, record:

- capability;
- access level;
- read/write status;
- permitted resources;
- financial or destructive impact;
- approval requirements;
- rate and spend limits.

### Memory

Define what may be remembered, for how long, at what scope, and with what source attribution.

### Planning Behavior

State when the agent may plan autonomously, when it must use a fixed workflow, and when it must escalate.

### Human Oversight

Define approval gates, escalation targets, exception handling, and response expectations.

### Evaluation

Every agent needs measurable criteria, including:

- task success;
- correctness;
- policy compliance;
- human intervention rate;
- latency;
- cost per successful outcome;
- user or business impact;
- recurring failure classes.

### Observability

Log model calls, tool calls, workflow state, approvals, failures, cost, and final disposition without exposing protected information unnecessarily.

## Standard Runtime Contract

Before acting, an agent should:

1. identify the objective;
2. retrieve relevant company and task context;
3. verify authority and permissions;
4. select an approved skill or workflow;
5. assess risk and approval requirements;
6. execute with bounded retries and spend;
7. evaluate the result;
8. record the outcome and unresolved issues;
9. escalate when success criteria are not met.

## Agent Types

MSTRMND may deploy specialized agents such as:

- operator agent: coordinates work across domains;
- sales agent: qualifies, routes, and supports revenue workflows;
- voice agent: handles natural-language calls with disclosure and escalation;
- content agent: plans and executes governed creative workflows;
- developer agent: works across repositories, issues, tests, and deployment;
- research agent: gathers, verifies, synthesizes, and cites evidence;
- executive agent: produces decision support without replacing executive authority;
- evaluation agent: reviews outputs, traces, and operational outcomes.

## Versioning

Changes to scope, permissions, tools, policies, or evaluation criteria require a version update and review. Production agents should be traceable to an exact specification revision.
