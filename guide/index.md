# @fjell/http-api - Agentic Guide

## Purpose

HTTP method helpers, error types, and request abstractions for Fjell network clients.

This guide is optimized for AI-assisted code generation and integration workflows.

## Documentation

- **[Usage Guide](./usage.md)** - API-oriented usage patterns and model-safe examples
- **[Integration Guide](./integration.md)** - Architecture placement, composition rules, and implementation guidance

## Key Capabilities

- Exposes typed wrappers for standard HTTP verbs and file upload flows
- Provides unified Fjell HTTP error handling utilities
- Supports simple API helper methods for concise client implementations

## Installation

```bash
npm install @fjell/http-api
```

## Public API Highlights

- `get`, `post`, `put`, `deleteMethod`, `patch`, and related method helpers
- `postFileMethod` and `uploadAsyncMethod` for file transfer scenarios
- `FjellHttpError`, `isFjellHttpError`, and error extraction utilities
