# Mobile experience and feature parity

Native and mobile PWA use the same daily screen order and labels, defined by `dailyScreens` in the shared design system: Briefing, Observations, Debrief & close, Timeline, Routes & exports. All destinations are visible in a wrapping, touch-sized navigation grid; no horizontal swipe is required to discover a feature. Routes, day exports and confirmed trip moves belong to the same destination on both platforms.

The PWA switches to the mobile layout below 900 CSS pixels, including narrow desktop windows. Resizing does not replace the application or reset the selected workflow. Browser, installed and fullscreen modes use the same responsive screens. Desktop may use sidebars and multiple columns; capabilities are not hidden at a breakpoint.

## Shared capabilities

| Area | Native and PWA |
| --- | --- |
| Setup | Local username, community, explicit backup restoration |
| Trip context | Community, trip and operational day selection; day/multi-day creation |
| Briefing | Objective, alternatives, hazards, triggers, mindset, CMAH, approval, private reflection, field decisions |
| Observations | Typed text, original audio, optional point location, corrections and explicit report submission |
| Debrief | Five reflection topics, closing prerequisites, leader confirmation, summary availability |
| Timeline | Recorded events, observation times, post-close indicators, event details |
| Routes & exports | GPX upload, external links, original files, public day export, confirmed day-trip move |
| Settings | Username, communities, private-inclusive full backup/restore, local storage information |
| Recovery | Local text drafts and stopped/attached recordings; no automatic approval/submission |

Platform controls may differ for file selection, sharing, microphone permissions, community/date selection and audio playback. Browser dictation is a capability-dependent enhancement; native records original audio and accepts typed text. Neither platform provides an offline transcription model. PWA legacy-browser archives are migration-specific and do not represent native domain functionality. No platform requires an API or fullscreen.

## Verification

Browser tests visit every daily destination at mobile and desktop widths, exercise offline evidence recovery, and enter/exit fullscreen when available. Native tests exercise shared navigation, explicit observation saving, briefing draft recovery and closing prerequisites. Real-device verification remains pending; use the [device checklist](../device-testing-checklist.md).
