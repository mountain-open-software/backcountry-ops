import PouchDB from 'pouchdb-browser';
import { replay } from '@open-mountain/domain';

const databases = new Map();
function database(scope, id) {
  if (!['user', 'community'].includes(scope) || !/^[a-zA-Z0-9-]{1,100}$/.test(id))
    throw new Error('Invalid database scope');
  const name = `open-mountain-${scope}-${id}`;
  if (!databases.has(name)) databases.set(name, new PouchDB(name));
  return databases.get(name);
}
const clean = (doc) => {
  const { _rev, ...rest } = doc;
  return rest;
};
export const workspaceStorage = {
  async readJournal(scope, id) {
    try {
      return await database(scope, id).get('journal');
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  },
  async append(scope, id, journal, event) {
    const events = [...(journal?.events || []), event];
    if (events.length > 5000 || JSON.stringify(events).length > 15000000)
      throw new Error(
        'Local journal limit reached. Export a backup before starting a new community.',
      );
    try {
      await database(scope, id).put({
        _id: 'journal',
        ...(journal?._rev ? { _rev: journal._rev } : {}),
        version: 2,
        events,
      });
    } catch (e) {
      if (e.status === 409)
        throw new Error(
          'This workspace changed in another tab. Reload and retry; your action was not applied.',
        );
      throw e;
    }
  },
  async putFile(scope, id, file) {
    if (file.size > 20 * 1024 * 1024) throw new Error('Files and recordings must be at most 20 MB');
    const fileId = `file-${crypto.randomUUID()}`;
    await database(scope, id).put({
      _id: fileId,
      name: file.name || 'recording.webm',
      size: file.size,
      _attachments: {
        content: { content_type: file.type || 'application/octet-stream', data: file },
      },
    });
    return fileId;
  },
  async getFile(scope, id, fileId) {
    return database(scope, id).getAttachment(fileId, 'content');
  },
  async legacy() {
    // Opening this known legacy database never overwrites or removes it.
    if (typeof indexedDB.databases === 'function') {
      const existing = await indexedDB.databases();
      if (!existing.some((entry) => entry.name?.endsWith('open-mountain-v1'))) return [];
    }
    const old = new PouchDB('open-mountain-v1');
    try {
      return (await old.allDocs({ include_docs: true })).rows
        .map((row) => row.doc)
        .filter((d) => !d._id.startsWith('_'));
    } finally {
      await old.close();
    }
  },
  async exportBackup(userId, communityIds) {
    const scopes = [['user', userId], ...communityIds.map((id) => ['community', id])];
    const stores = [];
    for (const [scope, id] of scopes) {
      const docs = (
        await database(scope, id).allDocs({ include_docs: true, attachments: true })
      ).rows.map((row) => clean(row.doc));
      stores.push({ scope, id, docs });
    }
    const backup = {
      format: 'open-mountain-local',
      version: 2,
      userId,
      exportedAt: new Date().toISOString(),
      stores,
    };
    if (JSON.stringify(backup).length > 100 * 1024 * 1024)
      throw new Error(
        'Full backup exceeds the 100 MB import limit. Download original recordings and GPX files individually and export day records before clearing storage.',
      );
    return backup;
  },
  async restoreBackup(backup, activeUserId) {
    if (
      backup?.format !== 'open-mountain-local' ||
      backup.version !== 2 ||
      !Array.isArray(backup.stores) ||
      backup.stores.length > 100
    )
      throw new Error('Unsupported backup');
    if (activeUserId && activeUserId !== backup.userId)
      throw new Error(
        'This backup belongs to another local user. Restore it in a fresh browser profile.',
      );
    const unique = new Set();
    let personal;
    const prepared = [];
    // Validate all scopes and journal histories before any write.
    for (const store of backup.stores) {
      const db = database(store.scope, store.id);
      if (unique.has(db.name) || !Array.isArray(store.docs))
        throw new Error('Duplicate or invalid backup database');
      unique.add(db.name);
      if (store.scope === 'user' && store.id !== backup.userId)
        throw new Error('Unexpected private database');
      const journal = store.docs.find((doc) => doc._id === 'journal');
      if (
        !journal ||
        journal.version !== 2 ||
        !Array.isArray(journal.events) ||
        journal.events.length > 5000
      )
        throw new Error('Invalid backup journal');
      if (journal.events.some((e) => e.scopeId !== store.id || e.actorId !== backup.userId))
        throw new Error('Unexpected backup ownership');
      const state = replay(journal.events, store.scope);
      if (store.scope === 'user') personal = state;
      if (store.scope === 'community') {
        const available = new Set(
          store.docs.filter((d) => d._attachments?.content?.data).map((d) => d._id),
        );
        for (const day of Object.values(state.days)) {
          for (const observation of Object.values(day.observations))
            if (observation.audioId && !available.has(observation.audioId))
              throw new Error('Backup is missing a recording');
          for (const route of day.routes)
            if (route.fileId && !available.has(route.fileId))
              throw new Error('Backup is missing a GPX file');
        }
      }
      const docIds = new Set();
      for (const doc of store.docs) {
        if (
          !doc ||
          typeof doc._id !== 'string' ||
          docIds.has(doc._id) ||
          (doc._id !== 'journal' && !/^file-[a-zA-Z0-9-]+$/.test(doc._id))
        )
          throw new Error('Invalid backup document');
        docIds.add(doc._id);
        if (doc._attachments) {
          const content = doc._attachments.content;
          if (
            Object.keys(doc._attachments).length !== 1 ||
            !content ||
            typeof content.data !== 'string' ||
            content.data.length > 28000000 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(content.data)
          )
            throw new Error('Invalid or oversized attachment');
        }
      }
      if (JSON.stringify(store.docs).length > 80000000)
        throw new Error('Backup database is too large');
      const existing = await this.readJournal(store.scope, store.id);
      if (existing) {
        const count = Math.min(existing.events.length, journal.events.length);
        if (
          JSON.stringify(existing.events.slice(0, count)) !==
          JSON.stringify(journal.events.slice(0, count))
        )
          throw new Error(
            'Backup diverges from local history. Merge is not supported; no records were changed.',
          );
      }
      prepared.push({ ...store, db, existing });
    }
    if (
      !personal?.profile ||
      personal.profile.id !== backup.userId ||
      personal.communities.some(
        (c) => !backup.stores.some((s) => s.scope === 'community' && s.id === c.id),
      )
    )
      throw new Error('Backup is missing a profile or community');
    for (const store of prepared) {
      for (const doc of store.docs.filter((d) => d._id !== 'journal')) {
        try {
          await store.db.get(doc._id);
        } catch (e) {
          if (e.status !== 404) throw e;
          await store.db.put(clean(doc));
        }
      }
      const incoming = store.docs.find((d) => d._id === 'journal');
      if (!store.existing || incoming.events.length > store.existing.events.length)
        await store.db.put({
          ...clean(incoming),
          ...(store.existing?._rev ? { _rev: store.existing._rev } : {}),
        });
    }
    return backup.userId;
  },
};
