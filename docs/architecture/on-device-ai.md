# Optional on-device AI and assistant history

Local AI is **disabled by default**. Enabling the preference does not download or load a model. The user must separately choose Download local model. Explicit English phrases and typed capture remain available without AI, network access or a model.

## Model and runtimes

The first model is SmolLM2 135M Instruct, Q4_K_M, from [bartowski/SmolLM2-135M-Instruct-GGUF](https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF), pinned to revision `09816acd5d99df7be770d85ea30822623dab342c`.

- Model file: `SmolLM2-135M-Instruct-Q4_K_M.gguf`, 105,454,432 bytes (about 106 MB).
- SHA-256: `2e8040ceae7815abe0dcb3540b9995eaa1fa0d2ca9e797d0a635ae4433c68c2d`. A download must match its expected size and checksum before becoming available.
- PWA: Wllama, single-thread WebAssembly, including Windows browsers that provide HTTPS, workers, WASM and Cache Storage. The optional WASM runtime adds about 11 MB. It is excluded from the default service-worker precache and fetched only with an explicit model download.
- Native: llama.rn, CPU-only, through an Expo development/release build. Expo Go cannot load the native runtime. Native engine binaries contribute to application size separately from the optional model file.
- The model's upstream license is Apache 2.0. The runtime packages have their own licenses and are pinned in the dependency lockfile.

The small model classifies short free-form notes as an observation, a private reflection, or unsupported. Browser generation is constrained to a JSON label; native generation is constrained by a grammar. It does not generate observation facts, route plans or safety advice. The application preserves the original note verbatim and creates at most one reviewable observation/reflection proposal. Explicit planning phrases still use the deterministic processor. Private/human-factor wording cannot be converted to a public observation by a model label.

No note text is sent to an inference service, including when the application has connectivity. Downloading model artifacts is the only model-related network operation. Model output cannot bypass the existing proposal executor, privacy scopes, stale-data checks, domain validation or explicit review.

## Space and battery policy

Settings show download size, progress, errors, cancellation and removal controls. Disabling AI stops current work and releases model memory; the file remains until Remove downloaded model is chosen. The model file and WASM cache are not in portable backups.

Download preflight reserves headroom: at least approximately 220 MB browser quota or 320 MB native free disk space. Runtime memory can be approximately 0.5–1 GB depending on the device and runtime. Browser-reported device memory below 2 GB blocks AI. Native app size and real memory use must be measured in a device build.

Inference is manual, foreground-only, one CPU thread, a 1,024-token context and a 45-second limit. Inputs requiring AI are limited to 2,000 characters. Deterministic supported phrases run first to avoid unnecessary inference. There is no continuous listening, background inference, automatic download, model warm-up at launch or model fallback to a cloud provider. Runtime memory is released after each inference. Progress rendering is throttled.

Low battery at or below 20% while unplugged blocks AI where battery information is available. Native low-power mode and browser data-saver downloads are also blocked. Hiding the browser tab or backgrounding the native app stops current work. Partial/invalid downloads do not become ready models. Browser storage eviction is possible; the user explicitly downloads again when needed.

## Native development build

The Expo config includes the llama.rn plugin with CPU-only settings. A native build is required after adding the module. From the repository root, if package-manager script policy prevented fetching native artifacts:

```sh
node node_modules/llama.rn/install/download-native-artifacts.js
npm exec -w @open-mountain/mobile -- expo prebuild
```

Build Android with the Android SDK or iOS on macOS with Xcode using the project's existing Expo run/build workflow. Do not use Expo Go to validate native inference. JS/Hermes export and Expo config validation do not certify native binary compilation, battery use, thermal behavior or device inference.

## Voice text is separate

The PWA has a Dictate note control with feature detection. It requests on-device browser recognition when the browser supports `processLocally`; missing language support produces a visible error. It never automatically installs speech language packs. Browsers that need an online speech service require a separate, explicit session opt-in before starting it. The optional text model does not transcribe audio.

Windows users can also use Win+H or configured system speech input. macOS, iOS and Android can use system/keyboard dictation. These facilities may require installed languages or connectivity; the application cannot guarantee offline OS speech. Original keyboard audio is not available to the app. Recording original audio remains available in Trip data.

## Private note history

Every submitted note is durably recorded in the user journal **before processing**. Original text is immutable. Status events record recorded, processing, review, clarification, saving, saved, error and stopped stages, with timestamps and processing engine. Unfinished processing after restart is shown as interrupted, never as saved. All communities' own notes are available with their original context; the UI initially renders 20 and offers earlier entries without discarding them.

Available older conversation messages migrate to private note records with deterministic IDs; their previous processing status is marked unknown. Messages discarded by the previous 12-message implementation cannot be reconstructed. A failed migration retains the original draft conversation for retry.

Notes and status timelines are included in full private-inclusive backups and excluded from public trip/day exports. Processing metadata is independent of shared trip records. Note-status events do not invalidate their own reviewed proposal; real profile, community or domain changes still do. Existing journal capacity limits apply: a full journal produces an explicit storage error rather than pruning history. Typed input remains in its recovery draft when recording/processing fails.

## Verification

Default tests use fake model adapters and speech APIs and never download weights. Tests cover default-off behavior, separate download consent, disabling during preflight, cancellation, resource errors, constrained labels, evidence preservation, private routing, history beyond 12 messages, migration IDs and proposal revision handling. Browser tests cover offline history, backup inclusion and zero model/WASM requests when merely enabling AI.

A real-model browser check must explicitly download in an isolated profile, verify the checksum, disable networking, process a free-form observation, review the proposal, and remove the model afterward. Device checks must separately exercise native builds, OS dictation in airplane mode, memory, low-power mode, cancellation and backgrounding. See the device checklist.
