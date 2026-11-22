// Driver-injected SQL adapter: Expo in production, real node:sqlite in contract tests.
export function createSqliteJournal(openDatabase) {
  const opened = new Map();
  async function connection(scope, id) {
    if (!['user', 'community'].includes(scope) || !/^[a-zA-Z0-9-]{1,100}$/.test(id))
      throw new Error('Invalid database scope');
    const name = `open-mountain-${scope}-${id}.db`;
    if (!opened.has(name)) {
      const promise = (async () => {
        const db = await openDatabase(name);
        await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
        const version = (await db.getFirstAsync('PRAGMA user_version')).user_version;
        if (version > 2)
          throw new Error('Database version is newer than this app; update before opening it');
        if (version === 0) {
          try {
            await db.execAsync(`BEGIN IMMEDIATE;
              CREATE TABLE IF NOT EXISTS journal (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL, events TEXT NOT NULL);
              CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, uri TEXT NOT NULL);
              PRAGMA user_version = 1;
              COMMIT;`);
          } catch (error) {
            try {
              await db.execAsync('ROLLBACK');
            } catch {}
            throw error;
          }
        }
        if (version < 2) {
          try {
            await db.execAsync(`BEGIN IMMEDIATE;
            CREATE TABLE IF NOT EXISTS drafts (key TEXT PRIMARY KEY, revision INTEGER NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL);
            PRAGMA user_version = 2; COMMIT;`);
          } catch (error) {
            try {
              await db.execAsync('ROLLBACK');
            } catch {}
            throw error;
          }
        }
        return db;
      })();
      opened.set(name, promise);
      promise.catch(() => opened.delete(name));
    }
    return opened.get(name);
  }
  return {
    async readDraft(userId, key) {
      const db = await connection('user', userId),
        row = await db.getFirstAsync(
          'SELECT revision, data, updated_at FROM drafts WHERE key = ?',
          key,
        );
      return row
        ? { revision: row.revision, value: JSON.parse(row.data), updatedAt: row.updated_at }
        : null;
    },
    async writeDraft(userId, key, value, expectedRevision) {
      const db = await connection('user', userId),
        json = JSON.stringify(value),
        updatedAt = new Date().toISOString();
      if (key.length > 500 || json.length > 250000)
        throw new Error('Draft is too large to autosave');
      if (expectedRevision === 0) {
        try {
          await db.runAsync(
            'INSERT INTO drafts (key,revision,data,updated_at) VALUES (?,1,?,?)',
            key,
            json,
            updatedAt,
          );
        } catch (error) {
          if (await db.getFirstAsync('SELECT key FROM drafts WHERE key = ?', key))
            throw new Error('Draft changed. Reload before overwriting it.');
          throw error;
        }
      } else {
        const result = await db.runAsync(
          'UPDATE drafts SET revision = revision + 1, data = ?, updated_at = ? WHERE key = ? AND revision = ?',
          json,
          updatedAt,
          key,
          expectedRevision,
        );
        if (result.changes !== 1) throw new Error('Draft changed. Reload before overwriting it.');
      }
      return { revision: expectedRevision + 1, value, updatedAt };
    },
    async readJournal(scope, id) {
      const db = await connection(scope, id);
      const row = await db.getFirstAsync('SELECT revision, events FROM journal WHERE id = 1');
      return row
        ? { _id: 'journal', _rev: String(row.revision), version: 2, events: JSON.parse(row.events) }
        : null;
    },
    async append(scope, id, journal, event) {
      const db = await connection(scope, id);
      const events = [...(journal?.events || []), event];
      const json = JSON.stringify(events);
      if (events.length > 5000 || json.length > 15000000)
        throw new Error(
          'Local journal limit reached. Export your data before starting another community.',
        );
      if (journal) {
        const result = await db.runAsync(
          'UPDATE journal SET revision = revision + 1, events = ? WHERE id = 1 AND revision = ?',
          json,
          Number(journal._rev),
        );
        if (result.changes !== 1)
          throw new Error('Workspace changed. Reload and retry; the action was not applied.');
      } else {
        try {
          await db.runAsync('INSERT INTO journal (id, revision, events) VALUES (1, 1, ?)', json);
        } catch (error) {
          if (await db.getFirstAsync('SELECT id FROM journal WHERE id = 1'))
            throw new Error('Workspace changed. Reload and retry; the action was not applied.');
          throw error;
        }
      }
    },
    async listFiles(scope, id) {
      return (await connection(scope, id)).getAllAsync('SELECT * FROM attachments ORDER BY id');
    },
    async addFile(scope, id, file) {
      const db = await connection(scope, id);
      await db.runAsync(
        'INSERT INTO attachments (id, name, mime, size, uri) VALUES (?, ?, ?, ?, ?)',
        file.id,
        file.name,
        file.mime,
        file.size,
        file.uri,
      );
    },
    async getFile(scope, id, fileId) {
      return (await connection(scope, id)).getFirstAsync(
        'SELECT * FROM attachments WHERE id = ?',
        fileId,
      );
    },
  };
}
