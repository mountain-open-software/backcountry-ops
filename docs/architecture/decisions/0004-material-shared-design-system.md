# ADR 0004 — Material components with shared design tokens

Status: Accepted for the web/native interface

## Context

The initial PWA and native app had custom styling and similar colors but no formal shared design foundation. The user requested that both use a design system. The apps use ordinary React/TypeScript and React Native; JSON rendering remains deferred.

## Decision

Adopt Material UI for the PWA and React Native Paper (Material Design 3) for Expo. Keep a dependency-free `@open-mountain/design-system` workspace with semantic tokens for palette, spacing, typography sizes, radii, focus, touch targets, and state opacity. Platform theme providers map those tokens to their toolkit.

Use Material web buttons, surfaces, and planning/debrief fields, and Paper native buttons/cards/text/fields through reusable platform primitives. Preserve existing form submission semantics, accessible labels, event handlers, and workflow validation. Keep application layouts responsive rather than forcing a universal component renderer.

Generate CSS variables from the shared token source, check for drift in repository verification, and test shared contrast/touch-target requirements. Explicit exported package subpaths are allowed by the workspace checker; importing undocumented sibling sources is still rejected.

## Consequences

Both applications have a consistent semantic brand and maintained toolkit foundations. They do not have pixel-identical component implementations; platform behavior and typography remain appropriate to web/native. No workflow, persistence, permission, or server capability changes are part of this UI migration.

Material dependencies increase application size. Web UI/persistence code is split into separately cached chunks and included in the offline precache; native builds bundle Paper with the application. Existing browser workflow tests and both native bundle exports verify integration. Native hardware/accessibility testing is still required.

The system is a code-level foundation, not an imported screen template or community-editable JSON layout. Future personal/community view configuration must be designed separately without bypassing domain rules.
