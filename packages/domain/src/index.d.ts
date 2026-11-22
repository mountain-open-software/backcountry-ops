export * from './models.js';
import type {
  CommunityState,
  UserState,
  Command,
  DomainEvent,
  Briefing,
  Debrief,
} from './models.js';
export const recordTypes: string[];
export function createRecord(
  type: string,
  organizationId: string,
  authorId: string,
  fields: { title?: string; [key: string]: unknown },
): Record<string, unknown>;
export const mindsets: string[];
export const problemTypes: string[];
export const blankDebrief: Debrief;
export function emptyCommunity(): CommunityState;
export function emptyUser(): UserState;
export function datesBetween(start: string, end: string): string[];
export function dayKey(tripId: string, date: string): string;
export function makeEvent(
  state: CommunityState | UserState,
  command: Command,
  context: { actorId: string; scopeId: string; now: string; eventId: string },
): DomainEvent;
export function applyCommunity(state: CommunityState, event: DomainEvent): CommunityState;
export function applyUser(state: UserState, event: DomainEvent): UserState;
export function replay(events: DomainEvent[], scope: 'user'): UserState;
export function replay(events: DomainEvent[], scope?: 'community'): CommunityState;

export function planLabel(index: number): string;
export function briefingPlans(
  briefing?: Partial<Briefing> | null,
): import('./models.js').TripPlan[];
export function reorderPlans(
  plans: import('./models.js').TripPlan[],
  from: number,
  to: number,
): import('./models.js').TripPlan[];

export function normalizeIdentifier(value: string): string;
export function validateIdentifier(value: unknown, label: string, maxLength?: number): void;
