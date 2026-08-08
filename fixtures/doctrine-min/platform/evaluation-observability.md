# Evaluation and Observability

## Purpose

MSTRMND systems must be measured as operating systems, not judged only by whether a response sounds convincing.

## Evaluation Dimensions

### Outcome

- Was the business objective achieved?
- Did the workflow produce a usable result?
- Did it influence revenue, cost, speed, quality, or customer experience?

### Quality

- correctness;
- completeness;
- relevance;
- policy and brand alignment;
- source quality and attribution;
- consistency across runs.

### Reliability

- task completion rate;
- tool-call success;
- retry and fallback rate;
- rollback rate;
- escaped defects;
- recurring failure modes.

### Human burden

- intervention rate;
- review minutes;
- escalation quality;
- operator satisfaction;
- avoidable handoffs.

### Economics

- model and tool spend;
- cost per successful outcome;
- labor hours saved;
- revenue or leads influenced;
- utilization and waste;
- marginal cost as volume increases.

### Performance

- latency;
- queue time;
- workflow duration;
- concurrency;
- timeout frequency.

## Evaluation Types

- offline benchmark suites;
- schema and deterministic checks;
- model-based review with calibrated rubrics;
- human review;
- shadow deployments;
- A/B tests;
- production outcome monitoring;
- adversarial and permission tests;
- regression tests after model, tool, or prompt changes.

## Required Tracing

A trace should connect:

```text
Objective → Context → Plan → Model calls → Tool calls → Approvals → Output → Outcome
```

Trace data should be searchable by customer, workflow, agent, skill, version, provider, date, status, and failure class.

## Scorecard

Every production deployment should maintain a scorecard containing at least:

- successful outcomes;
- total attempts;
- human intervention rate;
- cost per successful outcome;
- median and tail latency;
- policy violations;
- customer-facing errors;
- top recurring failure modes;
- changes made during the reporting period.

## Change Management

Model, prompt, skill, connector, workflow, and policy updates should be versioned. High-impact changes should be evaluated against a stable benchmark and released through staged deployment where practical.

## Learning Policy

Evaluation findings may produce recommendations automatically. Material changes to policy, permissions, business logic, or customer-facing behavior require review before deployment.
