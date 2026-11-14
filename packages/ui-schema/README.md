# UI schema

Versioned JSON screen definitions and validation. The component renderer belongs to the consuming web/native app. Do not introduce React, DOM, or native component imports here.

Import the public API as `@open-mountain/ui-schema` and declare it in the consuming workspace manifest. Do not import `src/` across workspace boundaries.

Verify from the repository root with `npm test -w @open-mountain/ui-schema`.
