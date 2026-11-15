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
