import { Directory, File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import * as Sharing from 'expo-sharing';
import { sqliteStorage } from '@open-mountain/storage-sqlite';
import { replay, type DomainEvent, type UserState } from '@open-mountain/domain';
type Scope = 'user' | 'community';
interface FileDoc {
  _id: string;
  name?: string;
  size?: number;
  _attachments?: { content: { content_type: string; data: string } };
  version?: number;
  events?: DomainEvent[];
}
interface Backup {
  format: 'open-mountain-local';
  version: 2;
  userId: string;
  exportedAt: string;
  stores: { scope: Scope; id: string; docs: FileDoc[] }[];
}
const root = new Directory(Paths.document, 'open-mountain');
function directory(scope: Scope, id: string) {
  if (!['user', 'community'].includes(scope) || !/^[a-zA-Z0-9-]{1,100}$/.test(id))
    throw new Error('Invalid file scope');
  const dir = new Directory(root, scope, id);
  dir.create({ idempotent: true, intermediates: true });
  return dir;
}
const identityFile = () => new File(root, 'active-profile.json');
export async function readIdentity(): Promise<{ userId: string; communityId?: string } | null> {
  const file = identityFile();
  if (!file.exists) return null;
  const data = JSON.parse(await file.text());
  if (typeof data.userId !== 'string')
    throw new Error('Local identity is invalid. Restore a backup rather than clearing storage.');
  return data;
}
export async function writeIdentity(userId: string, communityId?: string) {
  root.create({ idempotent: true, intermediates: true });
  const next = new File(root, 'active-profile-next.json');
  await next.write(JSON.stringify({ userId, communityId }));
  await next.move(identityFile(), { overwrite: true });
}
export const nativeStorage = {
  ...sqliteStorage,
  async putFile(scope: Scope, id: string, uri: string, name: string, mime: string) {
    const source = new File(uri);
    if (!source.exists || source.size <= 0 || source.size > 20 * 1024 * 1024)
      throw new Error('Choose a non-empty recording or file up to 20 MB');
    const fileId = `file-${randomUUID()}`,
      destination = new File(directory(scope, id), fileId);
    await source.copy(destination);
    await sqliteStorage.addFile(scope, id, {
      id: fileId,
      name,
      mime,
      size: destination.size,
      uri: destination.uri,
    });
    return fileId;
  },
  async fileUri(scope: Scope, id: string, fileId: string) {
    const record = await sqliteStorage.getFile(scope, id, fileId);
    const current = new File(directory(scope, id), fileId);
    if (!record || !current.exists)
      throw new Error('This attachment is missing. Restore it from a backup.');
    return { ...record, uri: current.uri };
  },
  async shareFile(scope: Scope, id: string, fileId: string) {
    const record = await this.fileUri(scope, id, fileId);
    const exportFile = new File(
      Paths.cache,
      `${record.id}-${record.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    );
    await new File(record.uri).copy(exportFile, { overwrite: true });
    await shareUri(exportFile.uri, record.mime);
  },
  async exportBackup(userId: string, communityIds: string[]) {
    const stores: Backup['stores'] = [];
    for (const [scope, id] of [
      ['user', userId],
      ...communityIds.map((id) => ['community', id]),
    ] as [Scope, string][]) {
      const journal = await this.readJournal(scope, id);
      if (!journal) throw new Error('A workspace journal is missing');
      const docs: FileDoc[] = [{ _id: 'journal', version: 2, events: journal.events }];
      for (const file of await this.listFiles(scope, id)) {
        const local = new File(directory(scope, id), file.id);
        if (!local.exists) throw new Error(`Missing attachment: ${file.name}`);
        docs.push({
          _id: file.id,
          name: file.name,
          size: file.size,
          _attachments: { content: { content_type: file.mime, data: await local.base64() } },
        });
      }
      stores.push({ scope, id, docs });
    }
    const backup: Backup = {
      format: 'open-mountain-local',
      version: 2,
      userId,
      exportedAt: new Date().toISOString(),
      stores,
    };
    if (JSON.stringify(backup).length > 100 * 1024 * 1024)
      throw new Error('Full backup exceeds 100 MB. Export individual day records and attachments.');
    return backup;
  },
  async restoreBackup(input: unknown, activeUserId?: string) {
    const backup = input as Backup;
    if (
      backup?.format !== 'open-mountain-local' ||
      backup.version !== 2 ||
      !Array.isArray(backup.stores) ||
      backup.stores.length > 100 ||
      !backup.userId
    )
      throw new Error('Unsupported backup');
    if (activeUserId && activeUserId !== backup.userId)
      throw new Error('This backup belongs to another user. Restore it on a fresh installation.');
    let personal: UserState | null = null;
    const seen = new Set();
    for (const store of backup.stores) {
      if (
        !store ||
        !['user', 'community'].includes(store.scope) ||
        !/^[a-zA-Z0-9-]{1,100}$/.test(store.id) ||
        !Array.isArray(store.docs) ||
        seen.has(`${store.scope}:${store.id}`)
      )
        throw new Error('Invalid or duplicate backup scope');
      seen.add(`${store.scope}:${store.id}`);
      if (store.scope === 'user' && store.id !== backup.userId)
        throw new Error('Unexpected private database');
      const journal = store.docs.find((d) => d._id === 'journal');
      if (
        journal?.version !== 2 ||
        !Array.isArray(journal.events) ||
        journal.events.length > 5000 ||
        journal.events.some((e) => e.scopeId !== store.id || e.actorId !== backup.userId)
      )
        throw new Error('Invalid event history');
      const state =
        store.scope === 'user'
          ? replay(journal.events, 'user')
          : replay(journal.events, 'community');
      if (store.scope === 'user') personal = state as UserState;
      const ids = new Set<string>();
      for (const doc of store.docs) {
        if (
          !doc ||
          ids.has(doc._id) ||
          (doc._id !== 'journal' && !/^file-[a-zA-Z0-9-]+$/.test(doc._id))
        )
          throw new Error('Invalid backup document');
        ids.add(doc._id);
        if (
          doc._id !== 'journal' &&
          (!doc._attachments?.content ||
            typeof doc._attachments.content.data !== 'string' ||
            doc._attachments.content.data.length > 28000000 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(doc._attachments.content.data))
        )
          throw new Error('Invalid attachment');
      }
      if (store.scope === 'community') {
        const community = replay(journal.events, 'community');
        for (const day of Object.values(community.days)) {
          for (const o of Object.values(day.observations))
            if (o.audioId && !ids.has(o.audioId))
              throw new Error('Backup is missing recording evidence');
          for (const r of day.routes)
            if (r.fileId && !ids.has(r.fileId)) throw new Error('Backup is missing GPX evidence');
        }
      }
      const local = await this.readJournal(store.scope, store.id);
      if (local) {
        const count = Math.min(local.events.length, journal.events.length);
        if (
          JSON.stringify(local.events.slice(0, count)) !==
          JSON.stringify(journal.events.slice(0, count))
        )
          throw new Error('Divergent history cannot be merged. No journals were changed.');
      }
    }
    if (
      !personal?.profile ||
      personal.profile.id !== backup.userId ||
      personal.communities.some((c) => !seen.has(`community:${c.id}`))
    )
      throw new Error('Backup is missing its profile or community');
    for (const store of backup.stores) {
      for (const doc of store.docs.filter((d) => d._id !== 'journal')) {
        if (await this.getFile(store.scope, store.id, doc._id)) continue;
        const local = new File(directory(store.scope, store.id), doc._id);
        await local.write(doc._attachments!.content.data, { encoding: 'base64' });
        await this.addFile(store.scope, store.id, {
          id: doc._id,
          name: doc.name || 'attachment',
          mime: doc._attachments!.content.content_type,
          size: local.size,
          uri: local.uri,
        });
      }
      let journal = await this.readJournal(store.scope, store.id);
      const incoming = store.docs.find((d) => d._id === 'journal')!.events!;
      for (const event of incoming.slice(journal?.events.length || 0)) {
        await this.append(store.scope, store.id, journal, event);
        journal = await this.readJournal(store.scope, store.id);
      }
    }
    await writeIdentity(backup.userId, personal.communities[0]?.id);
    return backup.userId;
  },
};
export async function shareUri(uri: string, mime = 'application/octet-stream') {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('File sharing is unavailable on this device');
  await Sharing.shareAsync(uri, { mimeType: mime });
}
export async function shareJSON(name: string, value: unknown) {
  const file = new File(Paths.cache, name.replace(/[^a-zA-Z0-9._-]/g, '_'));
  await file.write(JSON.stringify(value, null, 2));
  await shareUri(file.uri, 'application/json');
}
