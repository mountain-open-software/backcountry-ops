import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function setup(page, name = 'Alex') {
  await page.goto('/');
  await page.getByLabel('Your username').fill(name);
  await page.getByLabel('Community name').fill('Mountain community');
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await page.getByRole('button', { name: 'Trip data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My trips', exact: true })).toBeVisible();
}
async function trip(page, name = 'Ridge traverse', start = '2026-11-14', end = start) {
  const input = page.getByLabel('Trip name', { exact: true });
  if (!(await input.isVisible())) await page.getByText('＋ Plan a trip', { exact: true }).click();
  await input.fill(name);
  await page.getByLabel('Start date').fill(start);
  await page.getByLabel('End date').fill(end);
  await page.getByRole('button', { name: 'Create trip', exact: true }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}
async function observation(page, title = 'Fresh wind slab') {
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await page.getByLabel('Observation title', { exact: true }).fill(title);
  await page.getByLabel('Observation notes / transcript').fill('New loading on the ridge.');
  await page.getByRole('button', { name: 'Save observation', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}
async function finish(page) {
  await page.getByRole('button', { name: 'Submit my observations', exact: true }).click();
  await page.getByRole('button', { name: 'Debrief & close', exact: false }).click();
  for (const label of [
    'Expected versus observed conditions',
    'Planned versus actual activity',
    'Human factors discussed (public notes)',
    'What went well',
    'What needs to change',
  ])
    await page.getByLabel(label, { exact: true }).fill('Reviewed: recorded evidence and lessons.');
  await page.getByRole('button', { name: 'Complete my debrief', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm day closing', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Day is closed', exact: true })).toBeVisible();
}
async function offline(page, context) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
}
test('solo workflow persists offline; post-close corrections remain in timeline', async ({
  page,
  context,
}) => {
  const errors = [],
    remote = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173') && !r.url().startsWith('blob:'))
      remote.push(r.url());
  });
  await setup(page);
  await trip(page);
  await offline(page, context);
  await observation(page);
  await finish(page);
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await page.getByRole('button', { name: 'Correct', exact: true }).click();
  await page.getByLabel('Observation title', { exact: true }).fill('Corrected wind slab');
  await page.getByRole('button', { name: 'Save correction', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Corrected wind slab', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Timeline', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Day closed', exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Observation corrected', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('After day close', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Debrief & close', exact: false }).click();
  await expect(page.getByRole('button', { name: 'Day is closed', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
});
test('versioned briefing approval and personal database isolation', async ({ page }) => {
  await setup(page);
  await trip(page);
  await page.getByRole('button', { name: 'Add plan', exact: true }).click();
  const fields = [
    'Objective for the day',
    'Plan A — where we go',
    'Plan A — hazards and uncertainty',
    'Plan B — where we go',
    'Plan B — hazards and uncertainty',
    'Conditions that trigger a change',
    'My hazard assessment and rationale',
  ];
  for (const label of fields)
    await page.getByLabel(label, { exact: true }).fill(`Recorded ${label}`);
  await page.getByRole('button', { name: 'Save briefing draft', exact: true }).click();
  await page.getByRole('button', { name: 'Approve my plan', exact: true }).click();
  await expect(page.getByText('Plan approved', { exact: true })).toBeVisible();
  await page.getByLabel('My private reflection').fill('Private fatigue reflection');
  await page.getByRole('button', { name: 'Save private reflection' }).click();
  await page.getByLabel('Plan A — where we go', { exact: true }).fill('Revised ridge');
  await page.getByRole('button', { name: 'Save briefing draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Approve my plan', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export day — public data only' }).click();
  const exported = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(exported).not.toContain('Private fatigue reflection');
  await page.reload();
  await expect(page.getByLabel('My private reflection')).toHaveValue('Private fatigue reflection');
});
test('multiple dates and communities stay isolated; conflicting merge is unavailable', async ({
  page,
}) => {
  await setup(page);
  await trip(page, 'Expedition', '2026-11-14', '2026-11-16');
  await expect(page.getByLabel('Operational day').locator('option')).toHaveCount(3);
  await observation(page, 'Day one evidence');
  await page.getByLabel('Operational day').selectOption('2026-11-15');
  await expect(page.getByRole('heading', { name: 'Day one evidence', exact: true })).toHaveCount(0);
  await trip(page, 'Standalone', '2026-11-15');
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  await page.getByLabel('Move into an expedition').selectOption({ label: 'Expedition' });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Confirm move', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Merge — Coming soon');
  await expect(page.getByRole('heading', { name: 'Standalone', exact: true })).toBeVisible();
  await page.getByText('Profile & local backups', { exact: true }).click();
  await page.getByLabel('New local community').fill('Another community');
  await page.getByRole('button', { name: 'Create community', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Room for your next adventure' })).toBeVisible();
  await page
    .getByLabel('Local community', { exact: true })
    .selectOption({ label: 'Mountain community' });
  await expect(page.getByRole('button', { name: /Standalone/ })).toBeVisible();
});
test('GPX import, scoped export, and full backup restore retain offline evidence', async ({
  page,
  browser,
}) => {
  await setup(page);
  await trip(page);
  await observation(page, 'Recorded evidence');
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  await page.getByLabel('Route title', { exact: true }).fill('Planned ridge');
  const gpx =
    '<?xml version="1.0"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="50.2" lon="-120.1"><time>2026-11-14T10:00:00Z</time></trkpt></trkseg></trk></gpx>';
  await page.getByLabel('Or upload GPX').setInputFiles({
    name: 'ridge.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(gpx),
  });
  await page.getByRole('button', { name: 'Save route reference', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Planned ridge', exact: true })).toBeVisible();
  await page.getByText('Profile & local backups', { exact: true }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export full backup — includes private notes' }).click();
  const backup = await readFile(await (await pending).path());
  const fresh = await browser.newContext();
  const restored = await fresh.newPage();
  await restored.goto('/');
  await restored
    .getByLabel('Or restore a local backup')
    .setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backup });
  await restored.getByRole('button', { name: 'Trip data', exact: true }).click();
  await expect(
    restored.getByRole('heading', { name: 'Ridge traverse', exact: true }),
  ).toBeVisible();
  await restored.getByRole('button', { name: 'Observations', exact: false }).click();
  await expect(
    restored.getByRole('heading', { name: 'Recorded evidence', exact: true }),
  ).toBeVisible();
  await restored.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  const routeDownload = restored.waitForEvent('download');
  await restored.getByRole('button', { name: 'Download original GPX', exact: true }).click();
  expect(await readFile(await (await routeDownload).path(), 'utf8')).toBe(gpx);
  await fresh.close();
});
test('voice capture is retained as an offline-playable original recording', async ({
  page,
  context,
}) => {
  await setup(page);
  await trip(page);
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await page.getByRole('button', { name: '● Record observation', exact: true }).click();
  await expect(page.getByRole('button', { name: '■ Stop recording', exact: true })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: '■ Stop recording', exact: true }).click();
  await expect(page.getByLabel('Recording preview')).toBeVisible();
  await page.getByRole('button', { name: 'Save observation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Download recording', exact: true })).toBeVisible();
  await offline(page, context);
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  const audio = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recording', exact: true }).click();
  expect((await readFile(await (await audio).path())).byteLength).toBeGreaterThan(0);
});
test('microphone failure and invalid GPX never block typed offline-capable capture', async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Permission denied', 'NotAllowedError');
    };
  });
  await setup(page);
  await trip(page);
  await page.getByRole('button', { name: 'Debrief & close', exact: false }).click();
  await expect(
    page.getByRole('button', { name: 'Confirm day closing', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await page.getByRole('button', { name: '● Record observation', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Permission denied');
  await observation(page, 'Typed fallback');
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  await page.getByLabel('Route title', { exact: true }).fill('Invalid route');
  await page.getByLabel('Or upload GPX').setInputFiles({
    name: 'bad.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from('<html/>'),
  });
  await page.getByRole('button', { name: 'Save route reference', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid GPX');
  await expect(page.getByRole('heading', { name: 'Invalid route', exact: true })).toHaveCount(0);
});
test('confirmed move into non-overlapping expedition dates preserves observation identity', async ({
  page,
}) => {
  await setup(page);
  await trip(page, 'Expedition', '2026-11-14', '2026-11-16');
  await trip(page, 'Later day', '2026-11-17');
  await observation(page, 'Keep this evidence');
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  await page
    .getByLabel('Move into an expedition', { exact: true })
    .selectOption({ label: 'Expedition' });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Confirm move', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Expedition', exact: true })).toBeVisible();
  await page.getByLabel('Operational day').selectOption('2026-11-17');
  await page
    .getByRole('navigation', { name: 'Daily workflow' })
    .getByRole('button', { name: 'Observations' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Keep this evidence', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Operational day').locator('option')).toHaveCount(4);
});
test('unsaved text and stopped-audio drafts recover after view changes and offline reload', async ({
  page,
  context,
}) => {
  await setup(page);
  await trip(page);
  await page.getByLabel('Objective for the day', { exact: true }).fill('Recover this unsaved plan');
  await expect(
    page
      .getByText('Draft saved on this device. Not submitted or approved.', { exact: true })
      .first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await page.getByLabel('Observation title', { exact: true }).fill('Unsaved observation');
  await page.getByLabel('Observation notes / transcript').fill('Draft evidence');
  await page.getByRole('button', { name: '● Record observation', exact: true }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: '■ Stop recording', exact: true }).click();
  await expect(page.getByLabel('Recording preview')).toBeVisible();
  await expect(
    page.getByText('Draft saved on this device. Not submitted or approved.', { exact: true }),
  ).toBeVisible();
  await offline(page, context);
  await expect(page.getByLabel('Objective for the day', { exact: true })).toHaveValue(
    'Recover this unsaved plan',
  );
  await expect(page.getByRole('button', { name: 'Approve my plan', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await expect(page.getByLabel('Observation title', { exact: true })).toHaveValue(
    'Unsaved observation',
  );
  await expect(page.getByLabel('Recording preview')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unsaved observation', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Save observation', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Unsaved observation', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await expect(page.getByLabel('Observation title', { exact: true })).toHaveValue('');
});
test('PWA works resized and can enter/exit full screen without losing the workflow', async ({
  page,
}) => {
  await setup(page);
  await trip(page);
  for (const width of [320, 768, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByRole('heading', { name: 'Morning briefing' })).toBeVisible();
  }
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await page.getByRole('button', { name: 'Full screen', exact: true }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await page.getByRole('button', { name: 'Exit full screen', exact: true }).click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  }
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await expect(page.getByLabel('Observation title', { exact: true })).toBeVisible();
});

test('every mobile destination remains available after resizing to desktop', async ({ page }) => {
  await setup(page);
  await trip(page);
  const destinations = [
    ['Briefing', 'Morning briefing'],
    ['Observations', 'Capture an observation'],
    ['Debrief & close', 'Reflect on the day'],
    ['Timeline', 'Day timeline'],
    ['Routes & exports', 'Routes & tracks'],
  ];
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const [label, heading] of destinations) {
      await page
        .getByRole('navigation', { name: 'Daily workflow' })
        .getByRole('button', { name: label, exact: false })
        .click();
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Export day — public data only' })).toBeVisible();
  }
});

test('ordered plans add, reorder, remove and recover offline without implicit approval', async ({
  page,
  context,
}) => {
  await setup(page);
  await trip(page);
  await expect(page.getByRole('button', { name: 'Remove plan A', exact: true })).toBeDisabled();
  for (const value of ['Ridge', 'Forest', 'Valley']) {
    const letter = ['Ridge', 'Forest', 'Valley'].indexOf(value);
    if (letter) await page.getByRole('button', { name: 'Add plan', exact: true }).click();
    const label = String.fromCharCode(65 + letter);
    await page.getByLabel(`Plan ${label} — where we go`, { exact: true }).fill(value);
    await page
      .getByLabel(`Plan ${label} — hazards and uncertainty`, { exact: true })
      .fill(`${value} hazards`);
  }
  await page.getByRole('button', { name: 'Move plan C up', exact: true }).click();
  await expect(page.getByLabel('Plan B — where we go', { exact: true })).toHaveValue('Valley');
  await expect(page.getByLabel('Plan B — hazards and uncertainty', { exact: true })).toHaveValue(
    'Valley hazards',
  );
  await page.getByLabel('Objective for the day', { exact: true }).fill('Explore');
  await page
    .getByLabel('Conditions that trigger a change', { exact: true })
    .fill('Reassess if loading increases');
  await page
    .getByLabel('My hazard assessment and rationale', { exact: true })
    .fill('Uncertainty remains');
  await page.getByRole('button', { name: 'Save briefing draft', exact: true }).click();
  await page.getByRole('button', { name: 'Approve my plan', exact: true }).click();
  await expect(page.getByText('Plan approved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Move plan B up', exact: true }).click();
  await page.getByRole('button', { name: 'Remove plan C', exact: true }).click();
  await expect(
    page
      .getByText('Draft saved on this device. Not submitted or approved.', { exact: true })
      .first(),
  ).toBeVisible();
  await offline(page, context);
  await expect(page.getByLabel('Plan A — where we go', { exact: true })).toHaveValue('Valley');
  await expect(page.getByLabel('Plan B — where we go', { exact: true })).toHaveValue('Ridge');
  await expect(page.getByLabel('Plan C — where we go', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Save briefing draft', exact: true }).click();
  await expect(page.getByText('Plan approved', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Approve my plan', exact: true })).toBeEnabled();
});

test('profile and community settings normalize IDs and support create, update, list and delete offline', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByLabel('Your username', { exact: true }).fill('Alex Smith!');
  await expect(page.getByLabel('Your username', { exact: true })).toHaveValue('alex-smith');
  await page.getByLabel('Community name', { exact: true }).fill('Alpine Friends');
  await expect(page.getByLabel('Community ID', { exact: true })).toHaveValue('alpine-friends');
  await page.getByLabel('Community ID', { exact: true }).fill('My Club!');
  await expect(page.getByLabel('Community ID', { exact: true })).toHaveValue('my-club');
  await page.getByLabel('Community name', { exact: true }).fill('Alpine Friends Club');
  await expect(page.getByLabel('Community ID', { exact: true })).toHaveValue('my-club');
  await page.getByRole('button', { name: 'Create my workspace', exact: true }).click();
  await page.getByRole('button', { name: 'Trip data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My trips', exact: true })).toBeVisible();
  await trip(page, 'Keep this trip');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Selected community ID', { exact: true })).toHaveValue('my-club');
  const userId = await page.getByLabel('User ID', { exact: true }).inputValue();
  await page.getByLabel('Username', { exact: true }).fill('New User!');
  await page.getByRole('button', { name: 'Update username', exact: true }).click();
  await page.getByLabel('Selected community name', { exact: true }).fill('Renamed Mountain Club');
  await page.getByRole('button', { name: 'Save community', exact: true }).click();
  await expect(page.getByLabel('Local community', { exact: true })).toHaveValue('my-club');
  await expect(page.getByLabel('Selected community ID', { exact: true })).toHaveValue('my-club');
  await expect(page.getByRole('heading', { name: 'Keep this trip', exact: true })).toBeVisible();
  await page.getByLabel('New local community', { exact: true }).fill('Second Community');
  await expect(page.getByLabel('Community ID', { exact: true })).toHaveValue('second-community');
  await page.getByLabel('Community ID', { exact: true }).fill('MY Club');
  await page.getByRole('button', { name: 'Create community', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('already exists');
  await page.getByLabel('Community ID', { exact: true }).fill('second-community');
  await page.getByRole('button', { name: 'Create community', exact: true }).click();
  await expect(page.getByLabel('Selected community ID', { exact: true })).toHaveValue(
    'second-community',
  );
  await offline(page, context);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('User ID', { exact: true })).toHaveValue(userId);
  await expect(page.getByLabel('Username', { exact: true })).toHaveValue('new-user');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete Second Community', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Delete Second Community', exact: true }),
  ).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Second Community', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Delete Second Community', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel('Selected community ID', { exact: true })).toHaveValue('my-club');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Renamed Mountain Club', exact: true }).click();
  await expect(page.getByText('No active communities.', { exact: true })).toBeVisible();
  await page.getByLabel('New local community', { exact: true }).fill('New Start');
  await page.getByRole('button', { name: 'Create community', exact: true }).click();
  await expect(page.getByLabel('Selected community ID', { exact: true })).toHaveValue('new-start');
  const downloadPromise = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Export full backup — includes private notes', exact: true })
    .click();
  const backup = JSON.parse(await readFile(await (await downloadPromise).path(), 'utf8'));
  expect(JSON.stringify(backup)).toContain('Keep this trip');
  expect(JSON.stringify(backup)).toContain('CommunityDeleted');
});

test('assistant processes offline notes only after review and keeps private reflections out of trip exports', async ({
  page,
  context,
}) => {
  await setup(page);
  await trip(page);
  await page.getByRole('button', { name: 'Back to assistant', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Tell me about your day.', exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Message to assistant')
    .fill(
      'Our objective is to explore the ridge. Plan A is the forest. Hazards for plan A: overhead exposure. Observation: Wind loading on ridge. Private reflection: I feel fatigued.',
    );
  await page.getByRole('button', { name: 'Process notes', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Review proposed changes', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Trip data', exact: true }).click();
  await page.getByRole('button', { name: 'Observations', exact: false }).click();
  await expect(
    page.getByRole('heading', { name: 'Wind loading on ridge', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Save reviewed changes', exact: true }).click();
  await expect(page.getByText('Reviewed notes saved.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Trip data', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Wind loading on ridge', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Daily workflow' })
    .getByRole('button', { name: 'Briefing', exact: false })
    .click();
  await expect(page.getByLabel('Objective for the day', { exact: true })).toHaveValue(
    'to explore the ridge',
  );
  await expect(page.getByLabel('My private reflection')).toHaveValue('I feel fatigued.');
  await expect(page.getByRole('button', { name: 'Approve my plan', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Routes & exports', exact: false }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export day — public data only', exact: true }).click();
  const exported = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(exported).not.toContain('fatigued');
  expect(exported).toContain('Wind loading');
  await offline(page, context);
  await page.getByRole('button', { name: 'Back to assistant', exact: true }).click();
  await page.getByLabel('Message to assistant').fill('Close the day.');
  await page.getByRole('button', { name: 'Process notes', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Clarify your notes', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Save reviewed changes', exact: true }),
  ).toHaveCount(0);
});
test('assistant pending trip proposal recovers offline and creates multiple operational days', async ({
  page,
  context,
}) => {
  await setup(page);
  await page.getByRole('button', { name: 'Back to assistant', exact: true }).click();
  await page
    .getByLabel('Message to assistant')
    .fill('Create a trip called Assistant traverse from 2026-11-24 to 2026-11-26.');
  await page.getByRole('button', { name: 'Process notes', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Review proposed changes', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Draft saved on this device. Not submitted or approved.', { exact: true }),
  ).toBeVisible();
  await offline(page, context);
  await expect(
    page.getByRole('button', { name: 'Save reviewed changes', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save reviewed changes', exact: true }).click();
  await page.getByRole('button', { name: 'Trip data', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Assistant traverse', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Operational day').locator('option')).toHaveCount(3);
  await page.getByRole('button', { name: 'Back to assistant', exact: true }).click();
  await expect(page.getByLabel('Message to assistant')).toBeVisible();
});
