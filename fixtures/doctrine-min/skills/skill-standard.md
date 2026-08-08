# MSTRMND Skill Standard

Skills are reusable, versioned capabilities that can be invoked by multiple agents and workflows.

## Required Structure

Each skill should define:

- **Name and version**
- **Purpose**
- **Business outcome**
- **Inputs and validation**
- **Outputs and schema**
- **Required context**
- **Allowed tools**
- **Procedure**
- **Decision points**
- **Approval requirements**
- **Failure modes**
- **Escalation path**
- **Evaluation criteria**
- **Examples and test cases**

## Design Principles

### Capability over prompt

A skill is not merely a block of instructions. It is a defined operating capability with inputs, outputs, dependencies, safeguards, and evaluation.

### Composable

Skills should be narrow enough to combine into larger workflows without duplicating responsibilities.

### Provider-independent

Skills should describe required capability rather than a specific model unless a provider dependency is unavoidable.

### Observable

Skill execution should expose status, result, cost, latency, tool calls, and quality signals.

### Testable

Every production skill should include representative success, boundary, failure, and adversarial cases.

## Initial Skill Domains

- strategy and operational analysis;
- research and source verification;
- sales discovery and qualification;
- proposal and scope generation;
- customer communication;
- software engineering and review;
- creative strategy and media production;
- content adaptation and distribution;
- workflow design and automation;
- data analysis and reporting;
- evaluation and quality assurance;
- incident triage and escalation.

## Lifecycle

```text
Draft → Test → Approved → Production → Monitored → Revised or Retired
```

Changes that alter permissions, side effects, output contracts, or business policy require explicit review before production deployment.
