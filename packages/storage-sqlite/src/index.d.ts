import type { DraftStore } from '@open-mountain/application';
import type { JournalAdapter } from '@open-mountain/domain';
export interface NativeFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  uri: string;
}
export interface SqliteStorage extends JournalAdapter, DraftStore {
  listFiles(scope: 'user' | 'community', id: string): Promise<NativeFile[]>;
  addFile(scope: 'user' | 'community', id: string, file: NativeFile): Promise<void>;
  getFile(scope: 'user' | 'community', id: string, fileId: string): Promise<NativeFile | null>;
}
export const sqliteStorage: SqliteStorage;
