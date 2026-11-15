import { createWorkspace } from '@open-mountain/application';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSqliteJournal } from '../src/journal.js';
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'mountain-sqlite-'));
  const connections = [];
  const open = async (name) => {
    const db = new DatabaseSync(join(dir, name));
    connections.push(db);
    return {
      execAsync: async (sql) => db.exec(sql),
      getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args),
      getAllAsync: async (sql, ...args) => db.prepare(sql).all(...args),
      runAsync: async (sql, ...args) => db.prepare(sql).run(...args),
    };
  };
  return {
    open,
    cleanup() {
      for (const db of connections) db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
const event = {
  id: 'event-1',
  type: 'CommunityCreated',
  scopeId: 'community-1',
  actorId: 'user-1',
  version: 1,
  recordedAt: '2026-11-14T10:00:00Z',
  occurredAt: '2026-11-14T10:00:00Z',
  payload: { name: 'Local' },
};
test('SQLite migrations are repeatable and events survive adapter reopening', async () => {
  const f = fixture();
  try {
    const first = createSqliteJournal(f.open);
    assert.equal(await first.readJournal('community', 'community-1'), null);
    await first.append('community', 'community-1', null, event);
    const recovered = await createSqliteJournal(f.open).readJournal('community', 'community-1');
    assert.equal(recovered._rev, '1');
    assert.deepEqual(recovered.events, [event]);
  } finally {
    f.cleanup();
  }
});
test('SQL compare-and-swap rejects stale appends without losing history', async () => {
  const f = fixture();
  try {
    const storage = createSqliteJournal(f.open);
    await storage.append('community', 'community-1', null, event);
    const old = await storage.readJournal('community', 'community-1');
    await storage.append('community', 'community-1', old, { ...event, id: 'event-2' });
    await assert.rejects(
      storage.append('community', 'community-1', old, { ...event, id: 'event-3' }),
      /Workspace changed/,
    );
    assert.equal((await storage.readJournal('community', 'community-1')).events.length, 2);
  } finally {
    f.cleanup();
  }
});
test('user/community databases isolate journals and attachment indexes', async () => {
  const f = fixture();
  try {
    const storage = createSqliteJournal(f.open);
    await storage.append('user', 'user-1', null, { ...event, payload: { text: 'Private' } });
    assert.equal(await storage.readJournal('community', 'community-1'), null);
    await storage.addFile('user', 'user-1', {
      id: 'audio-1',
      name: 'voice.m4a',
      mime: 'audio/mp4',
      size: 12,
      uri: 'file:///private/voice.m4a',
    });
    assert.equal((await storage.listFiles('community', 'community-1')).length, 0);
    assert.equal((await storage.getFile('user', 'user-1', 'audio-1')).name, 'voice.m4a');
    await assert.rejects(storage.readJournal('user', '../unsafe'), /Invalid database scope/);
  } finally {
    f.cleanup();
  }
});

test('native SQL persists the shared solo submission/debrief/closing lifecycle', async () => {
  const f = fixture();
  try {
    let number = 0;
    const adapter = createSqliteJournal(f.open),
      service = createWorkspace(adapter, {
        createId: () => `event-${++number}`,
        now: () => '2026-11-14T10:00:00.000Z',
      });
    const send = (type, payload) =>
      service.dispatch('community', 'community-1', 'user-1', { type, payload });
    await send('CommunityCreated', { name: 'Native' });
    await send('TripCreated', {
      id: 'trip-1',
      title: 'Day trip',
      startDate: '2026-11-14',
      endDate: '2026-11-14',
      timeZone: 'UTC',
    });
    const dayId = 'trip-1:2026-11-14';
    await assert.rejects(send('DayClosed', { dayId }));
    await send('ReportSubmitted', { dayId, observationVersion: 0, nothingToAdd: true });
    await send('DebriefSaved', {
      dayId,
      expected: 'As expected',
      actual: 'As planned',
      humanFactors: 'Pace discussed',
      good: 'Turned early',
      change: 'Earlier start',
    });
    await send('DayClosed', { dayId });
    const reopened = createWorkspace(createSqliteJournal(f.open));
    const loaded = await reopened.read('community', 'community-1');
    assert.equal(loaded.state.days[dayId].closedAt, '2026-11-14T10:00:00.000Z');
    assert.equal(loaded.journal.events.length, 5);
  } finally {
    f.cleanup();
  }
});
