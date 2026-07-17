# Feature Architecture

This project now uses a layered feature public API pattern.

## Goal

- Keep imports stable and professional by exposing each feature through one entrypoint.
- Reduce coupling from deep imports such as `feature/api/...` or `feature/components/...`.
- Prepare the codebase for gradual migration to stricter clean architecture.

## Feature Layers

Each feature can expose these folders:

- `application`: react-query hooks and use cases
- `infrastructure`: API clients and external data access
- `presentation`: UI components that belong to the feature
- `index.ts`: feature public API (re-export from layers)

## Import Rules

- Prefer: `@/features/<feature>`
- Avoid: `@/features/<feature>/api/...`
- Avoid: `@/features/<feature>/components/...`

## Current Status

Public API entrypoints were added for:

- auth
- classSchedule
- coach
- student
- studentAttendance
- studentEnrollment
- tuitionPayment
- user

This is an incremental refactor. Existing implementation files remain in place, while consumers now import from feature entrypoints.
