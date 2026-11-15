import type { DraftStore } from '@open-mountain/application';
import type { JournalAdapter } from '@open-mountain/domain';
export interface LocalBackup {
  format: 'open-mountain-local';
  version: 2;
  userId: string;
  exportedAt: string;
  stores: unknown[];
}
export interface WorkspaceStorage extends JournalAdapter, DraftStore {
  putFile(scope: 'user' | 'community', id: string, file: File): Promise<string>;
  getFile(scope: 'user' | 'community', id: string, fileId: string): Promise<Blob>;
  legacy(): Promise<Record<string, unknown>[]>;
  exportBackup(userId: string, communityIds: string[]): Promise<LocalBackup>;
  restoreBackup(backup: unknown, activeUserId?: string): Promise<string>;
}
export const workspaceStorage: WorkspaceStorage;
