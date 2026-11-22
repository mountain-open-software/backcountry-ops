# Device release checklist

Status: Pending real-device execution. Simulator-free tests do not establish hardware support.

Record device/OS, app/browser version, build/commit, expected/actual result, and pass/fail for each scenario. Use synthetic observations, not confidential participant data.

## PWA: iPhone Safari and Android Chrome

- Open in a normal browser tab at portrait/landscape sizes; resize desktop windows to 320, 390, 768, and 1440 pixels. No horizontal overflow or unreachable controls.
- Install/add to Home Screen, launch standalone, and test notches/safe areas and keyboard coverage. Run the same workflow without installation.
- Enter/exit browser full screen where supported. If unsupported/denied, normal browser operation continues.
- After an initial online load, reopen offline; create/edit drafts, stop audio, save observations, submit, debrief, and close.
- Switch views/days and reload with an unsaved briefing, observation, decision, or debrief. Wait for “Draft saved” before restarting. Verify isolation between communities/days and private notes.
- Deny/revoke microphone and location. Typed capture still works. Test a call/interruption and backgrounding while recording; preserve stopped recordings, and document any unfinished recording lost to force-termination.
- Stop audio and wait for draft persistence; reload before saving the observation. Recover/play the preview and then explicitly save it. Confirm a draft alone never submits, approves, or closes a day.
- Export/restore a full backup containing committed audio/GPX; verify source files open independently. Draft text is excluded from portable backups: save first.
- Fill or constrain storage; failure must be visible, not reported as saved. Test the storage estimate and persistence request where supported.

## Expo: physical iPhone and Android

- Use the supported Expo SDK/dev build and note whether testing Expo Go or a standalone build. Offline startup of an installed binary is separate from downloading a development bundle.
- Test profile/community setup, one day per trip/date, plan approval/revision, and delegated/departure decisions.
- Repeat the draft, permission, audio, background-interruption, GPX, backup, submission/debrief/closing, and late-correction scenarios above.
- Kill/relaunch only after the saved indicator appears; verify SQLite data/drafts and stopped recordings. A recording in progress cannot be guaranteed after process termination.
- Test native sharing/file picking and point-location accuracy unavailable/denied states.
- Check font scaling, screen readers, hardware keyboard, touch targets, and keyboard dismissal/reachability on phones and tablets.

## Release gate

Do not mark these checks passed without device evidence. Fix failures or document specific unsupported behavior before field use. Automated browser/native-component/SQLite tests remain separate evidence; they are not a substitute for microphone, background, install, or assistive-technology testing on hardware.

## Assistant and keyboard dictation

- On iOS and Android, test keyboard dictation in airplane mode with the intended language downloaded; record whether the keyboard actually supports offline speech. Do not infer support from typed offline tests.
- Confirm the composer stays visible with the keyboard open and large accessibility text.
- Test Trip data, Settings and Back to assistant on phone/tablet; verify selected context remains clear.
- Verify pending proposals recover after termination, private reflections remain private, and original audio recording still works through Trip data.
