# ADR 0005 — Local drafts and PWA display modes

Status: Accepted

## Decision

Keep editable drafts separate from domain events. A shared application draft session persists revision-checked values in the personal database, with keys scoped to community, day, editor and relevant plan version. PouchDB uses document revisions; SQLite migration 2 adds a draft table without replacing journal or attachment data. Failed persistence remains visible and retains text in memory. Draft recovery never approves plans or submits observations.

Stopped or attached recordings are copied to durable local attachment storage before their draft references them. Recording still in progress is not crash recoverable. Abandoned attachment cleanup is deferred. Draft text is excluded from portable backups; explicitly save domain records before export.

Support normal browser windows, installed standalone mode, and optional Fullscreen API operation through the same responsive React layout. Fullscreen capability is detected, failures allow continued window use, and safe-area spacing accounts for mobile screens. No workflow requires fullscreen or installation.

## Verification and limits

Shared draft concurrency/recovery tests, SQLite schema upgrade tests, native screen interaction tests, and Chromium desktop/mobile draft and display-transition tests cover these boundaries. Hardware permission dialogs, installed Safari behavior, operating-system termination and native audio need the real-device checklist. Native UI tests mock hardware capture; they do not certify device recording.
