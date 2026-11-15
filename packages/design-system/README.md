# Open Mountain design system

Shared semantic tokens for the Material-based web and native applications. The PWA uses **Material UI**; Expo uses **React Native Paper / Material Design 3**. These are established component libraries, not copied application templates or a custom universal renderer.

`src/index.ts` is the source of truth for colors, spacing, radii, typography sizes, touch targets, focus, and interaction opacity. It has no React, browser, native, or domain dependencies. App-specific theme adapters map it into the platform library:

- [Web theme](../../projects/pwa/src/theme.ts): Material UI palette, typography, buttons, fields, and surface defaults.
- [Native theme](../../projects/mobile/src/theme.ts): Paper MD3 color scheme and shape.
- [Web primitives](../../projects/pwa/src/components/ui.tsx): Material buttons/surfaces preserving native HTML form and section semantics.
- [Native primitives](../../projects/mobile/src/components/Controls.tsx): Paper buttons, cards, text, and fields.

Layouts and device interactions remain platform-specific. Material UI and Paper are different implementations, so this system aims for shared visual identity and interaction principles, not pixel-identical rendering.

## Changing the theme

1. Edit semantic tokens in `src/index.ts`; use meaning (`primary`, `surface`, `error`) rather than new feature-specific hex colors.
2. Run `npm run design:generate` to regenerate `src/tokens.css` for browser layout styles. Do not edit generated CSS manually.
3. Update a platform theme/primitive only when its library needs a platform-specific mapping.
4. Run `npm run check` and the browser/native bundle checks.

Import tokens through `@open-mountain/design-system`; the explicit `@open-mountain/design-system/styles.css` public export is for the browser only. Native must not import CSS. Tokens remain separate from the future community/personal view configuration and do not change domain rules.

## Accessibility baseline

Controls use at least 48 CSS pixels/native dp in height. Shared normal text/status color pairs are tested against WCAG AA contrast; focus/control boundaries are tested for non-text contrast. Toolkit controls retain keyboard, disabled, focus, and screen-reader behavior. Responsive layout and workflow tests run at desktop and mobile sizes. These checks are a baseline, not a full accessibility certification or a replacement for native assistive-technology/device testing.
