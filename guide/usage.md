# Usage Guide

Comprehensive usage guidance for `@fjell/http-api`.

## Installation

```bash
npm install @fjell/http-api
```

## API Highlights

- `get`, `post`, `put`, `deleteMethod`, `patch`, and related method helpers
- `postFileMethod` and `uploadAsyncMethod` for file transfer scenarios
- `FjellHttpError`, `isFjellHttpError`, and error extraction utilities

## Quick Example

```ts
import { get, FjellHttpError, isFjellHttpError } from "@fjell/http-api";

try {
  const widget = await get("/api/widgets/123");
  console.log(widget);
} catch (error) {
  if (isFjellHttpError(error)) {
    throw new FjellHttpError(error.status, error.message, error.details);
  }
  throw error;
}
```

## Model Consumption Rules

1. Import from the package root (`@fjell/http-api`) instead of deep-internal paths unless explicitly documented.
2. Keep usage aligned with exported public symbols listed in this guide.
3. Prefer explicit typing at package boundaries so generated code remains robust during upgrades.
4. Keep error handling deterministic and map infrastructure failures into domain-level errors.
5. Co-locate integration wrappers in your app so model-generated code has one canonical entry point.

## Best Practices

- Keep examples and abstractions consistent with existing Fjell package conventions.
- Favor composable wrappers over one-off inline integration logic.
- Add targeted tests around generated integration code paths.
