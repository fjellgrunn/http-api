# Integration Guide

Guide for integrating `@fjell/http-api` into larger Fjell-based systems.

## Where It Fits

HTTP method helpers, error types, and request abstractions for Fjell network clients.

## Recommended Integration Pattern

- Use in @fjell/client-api or custom SDK layers rather than direct fetch duplication
- Normalize all upstream errors into FjellHttpError before bubbling to UI/provider layers
- Centralize retry/backoff policy in wrapper functions around these primitives

## System Composition Checklist

- Define package boundaries: schema/types, transport, operations, adapters, and UI.
- Keep contracts stable by sharing @fjell/types interfaces where applicable.
- Centralize retries/timeouts/logging around infrastructure-facing operations.
- Validate inputs at API boundaries before invoking persistence or provider layers.
- Add contract and integration tests for every generated workflow.

## Cross-Library Pairings

- Pair with @fjell/types for shared contracts.
- Pair with @fjell/validation for input and schema checks.
- Pair with @fjell/logging for observability in integration flows.
- Pair with storage/router/provider packages based on your runtime architecture.

## Integration Example Shape

Use this package behind an application service layer that exposes stable domain methods. Generated code should call those service methods, not raw infrastructure primitives, unless your architecture intentionally keeps infrastructure at the edge.
