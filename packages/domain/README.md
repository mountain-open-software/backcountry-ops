# Domain

Record creation and validation. Keep this package free of browser, UI, and persistence imports. The full canonical expedition model is planned; the current generic record factory does not implement it.

Import the public API as `@open-mountain/domain` and declare it in the consuming workspace manifest. Do not import `src/` across workspace boundaries.

Verify from the repository root with `npm test -w @open-mountain/domain`.
