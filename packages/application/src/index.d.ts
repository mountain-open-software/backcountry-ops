import type {
  CommunityState,
  UserState,
  CommunityCommand,
  UserCommand,
  JournalAdapter,
  Journal,
} from '@open-mountain/domain';
export interface WorkspaceService {
  read(scope: 'user', id: string): Promise<{ journal: Journal | null; state: UserState }>;
  read(scope: 'community', id: string): Promise<{ journal: Journal | null; state: CommunityState }>;
  dispatch(
    scope: 'user',
    id: string,
    actorId: string,
    command: UserCommand,
    commandId?: string,
  ): Promise<{ journal: Journal | null; state: UserState }>;
  dispatch(
    scope: 'community',
    id: string,
    actorId: string,
    command: CommunityCommand,
    commandId?: string,
  ): Promise<{ journal: Journal | null; state: CommunityState }>;
}
export function createWorkspace(
  adapter: JournalAdapter,
  options?: { createId?: () => string; now?: () => string },
): WorkspaceService;
export function organizationsForUser(
  documents: Record<string, unknown>[],
  userId: string,
): Record<string, unknown>[];
export function recordsForContext(
  documents: Record<string, unknown>[],
  userId: string,
  organizationId: string,
  type: string,
): Record<string, unknown>[];
export function requireMembership(
  documents: Record<string, unknown>[],
  userId: string,
  organizationId: string,
): void;
export interface DraftRecord {
  revision: number;
  value: unknown;
  updatedAt: string;
}
export interface DraftStore {
  readDraft(userId: string, key: string): Promise<DraftRecord | null>;
  writeDraft(
    userId: string,
    key: string,
    value: unknown,
    expectedRevision: number,
  ): Promise<DraftRecord>;
}
export interface DraftSnapshot<T> {
  value: T;
  status: 'loading' | 'clean' | 'recovered' | 'saving' | 'saved' | 'error';
  recovered: boolean;
  error: string;
}
export interface DraftSession<T> {
  getSnapshot(): DraftSnapshot<T>;
  subscribe(listener: () => void): () => void;
  set(value: T | ((old: T) => T)): void;
  clear(): Promise<void>;
  reset(value: T): Promise<void>;
  flush(): Promise<void>;
  ready: Promise<void>;
}
export function createDraftSession<T>(
  storage: DraftStore,
  userId: string,
  key: string,
  initialValue: T,
): DraftSession<T>;
