# Mobile experience and feature parity

The assistant is the default workspace. Native and mobile PWA expose the same daily data screens through Trip data, with the same order and labels, defined by `dailyScreens` in the shared design system: Briefing, Observations, Debrief & close, Timeline, Routes & exports. All destinations are visible in a wrapping, touch-sized navigation grid; no horizontal swipe is required to discover a feature. Routes, day exports and confirmed trip moves belong to the same destination on both platforms.

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
| Settings | Profile username, separate community names/IDs, community create/list/update/select/delete, private-inclusive full backup/restore, local storage information |
| Recovery | Local text drafts and stopped/attached recordings; no automatic approval/submission |

Platform controls may differ for file selection, sharing, microphone permissions, community/date selection and audio playback. Browser dictation is a capability-dependent enhancement; native records original audio and accepts typed text. Neither platform provides an offline transcription model. PWA legacy-browser archives are migration-specific and do not represent native domain functionality. No platform requires an API or fullscreen.

## Verification

Browser tests visit every daily destination at mobile and desktop widths, exercise offline evidence recovery, and enter/exit fullscreen when available. Native tests exercise shared navigation, explicit observation saving, briefing draft recovery and closing prerequisites. Real-device verification remains pending; use the [device checklist](../device-testing-checklist.md).

## Ordered briefing plans

Both apps edit `Briefing.plans`, an ordered array of `{ id, description, hazards }`. Stable IDs identify options; A/B/C labels are derived from array position (continuing AA after Z). Add, remove and up/down actions are identical on both platforms. The shared change-trigger section remains part of the briefing; users review it after reordering because free text may reference letters.

The domain validates 1–100 plans, unique IDs, supported fields and text sizes. Approval requires nonblank content and hazards for every plan. Saving any list change uses the existing `BriefingSaved` event and invalidates prior approval. Legacy fixed A/B payloads and recovered drafts are projected into two deterministic-ID plans without modifying original historical events. New saves write the ordered array. No database-table migration is needed for the JSON journal.

## Community lifecycle and compatibility

Identity creation events (`ProfileConfigured`, `CommunityAdded`, `CommunityCreated`) now use event schema 2 to enforce normalized handles for new writes. Version 1 journals still replay under their original identity validation so existing usernames and IDs are never silently changed. User IDs and community IDs stay stable after creation.

`CommunityRenamed` and `CommunityDeleted` belong to the community journal. `CommunityUpdated` and `CommunityRemoved` project their result into the personal community index. Refresh reconciles the index after interrupted writes. Removal uses tombstones (`deletedAt` / `removedAt`); all memberships remain in full-backup scope while active selectors exclude removed communities. Empty active membership lists are valid and keep Settings available. There is no physical erasure or ID reuse in this version.

## Offline assistant boundary

The shared application package parses supported English phrases into reviewable commands. Both front ends retain original notes and processing statuses in the private user journal, included in private full backups. Composer text and pending proposals remain local drafts. Both use the same proposal executor. See [on-device AI and assistant history](on-device-ai.md). Proposals bind to the user/community/day and journal revisions. Execution permits trip creation, briefing drafts, observations, private reflections and complete debriefs; approvals, submissions, closing and destructive actions are excluded. Each accepted action uses a stable event ID; retrying an interrupted proposal recognizes previously recorded events. CAS append still protects individual journal writes. Multi-record proposals are resumable, not atomic transactions across databases.

Web Trip data is a side panel on wide windows and a modal drawer on narrow windows; it includes keyboard focus handling and a route back to the assistant. Native uses the same primary assistant and data destinations, with side-by-side views at tablet widths. All legacy forms remain available.

Keyboard speech-to-text is provided by the operating system, independently of the shared text processor. Device dictation and third-party keyboard privacy/network settings must be tested on hardware; the app cannot guarantee offline speech or preserve keyboard audio it never receives.
