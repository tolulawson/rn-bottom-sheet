# ADR-0003: Keep React Navigation Support as Optional Adapter

- Status: Accepted
- Date: 2026-02-12

## Context

Consumers need React Navigation compatibility, but hard-coupling the core package increases dependency and upgrade risk.

## Decision

Keep core sheet package navigation-agnostic; publish optional adapter utilities under a separate subpath/package boundary.

## Consequences

1. Lower coupling and cleaner core API.
2. Easier support for non-React-Navigation consumers.
3. Adapter package carries specific integration complexity.
