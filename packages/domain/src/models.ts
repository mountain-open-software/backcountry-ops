export interface AvalancheProblem {
  type: string;
  terrain: string;
  likelihood: string;
  evidence: string;
  minSize: string;
  maxSize: string;
}
export interface TripPlan {
  id: string;
  description: string;
  hazards: string;
}
export interface Briefing {
  plans: TripPlan[];
  objective: string;
  /** Legacy saved briefings and drafts; converted to plans on read. */
  planA?: string;
  hazardsA?: string;
  planB?: string;
  hazardsB?: string;
  triggers: string;
  assessment: string;
  mindset: string;
  problems: AvalancheProblem[];
  version?: number;
  dayId?: string;
}
export interface Debrief {
  expected: string;
  actual: string;
  humanFactors: string;
  good: string;
  change: string;
  completedAt?: string;
  dayId?: string;
}
export interface PointLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  capturedAt: string;
}
export interface Observation {
  id: string;
  title: string;
  notes: string;
  observedAt: string;
  location: string;
  audioId?: string | null;
  audioName?: string | null;
  point?: PointLocation;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  dayId?: string;
}
export interface Route {
  dayId: string;
  title: string;
  kind: 'planned' | 'actual';
  url: string;
  fileId: string | null;
  fileName: string | null;
  points?: number;
  segments?: number;
  authorId?: string;
  recordedAt?: string;
}
export interface FieldDecision {
  dayId: string;
  authority: 'within' | 'departure';
  action: string;
  rationale: string;
  trigger: string;
  soloApproval: boolean;
  eventId?: string;
  planVersion?: number;
}
export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  leaderId?: string;
  movedTo?: string;
}
export interface OperationalDay {
  id: string;
  tripId: string;
  date: string;
  observations: Record<string, Observation>;
  routes: Route[];
  observationVersion: number;
  briefing: Briefing | null;
  approval: { planVersion: number; eventId: string; approvedAt: string } | null;
  decisions: FieldDecision[];
  debrief: Debrief | null;
  submission: {
    observationVersion: number;
    submittedAt: string;
    authorId: string;
    amendedAt?: string;
  } | null;
  closedAt: string | null;
  summary: 'not-configured';
  summaryRequestedAt?: string;
}
export type ViewId = 'briefing' | 'observations' | 'debrief' | 'timeline';
export interface FieldDefinition {
  name: string;
  label: string;
  kind: 'text' | 'date' | 'textarea';
  required?: boolean;
}
export interface FormDefinition {
  version: number;
  fields: FieldDefinition[];
}
export interface ViewConfig {
  version: 1;
  navigation: { id: ViewId; label: string }[];
  views: { briefing: FormDefinition; debrief: FormDefinition };
}
export interface CommunityState {
  community: { id: string; name: string; ownerId: string } | null;
  trips: Record<string, Trip>;
  days: Record<string, OperationalDay>;
  revision: number;
}
export interface UserState {
  profile: { id: string; username: string } | null;
  communities: { id: string; name: string }[];
  reflections: Record<string, { text: string; updatedAt: string }>;
  revision: number;
}
export type CommunityCommand =
  | { type: 'CommunityCreated'; payload: { name: string } }
  | { type: 'TripCreated'; payload: Trip }
  | { type: 'TripMoved'; payload: { sourceId: string; targetId: string; confirmed: boolean } }
  | { type: 'BriefingSaved'; payload: Briefing & { dayId: string } }
  | { type: 'PlanApproved'; payload: { dayId: string; planVersion: number } }
  | { type: 'FieldDecisionRecorded'; payload: FieldDecision }
  | { type: 'ObservationRecorded'; payload: Observation & { dayId: string } }
  | { type: 'ObservationCorrected'; payload: Observation & { dayId: string } }
  | {
      type: 'ReportSubmitted';
      payload: { dayId: string; observationVersion: number; nothingToAdd: boolean };
    }
  | { type: 'DebriefSaved'; payload: Debrief & { dayId: string } }
  | { type: 'DayClosed'; payload: { dayId: string } }
  | { type: 'RouteAttached'; payload: Route };
export type UserCommand =
  | { type: 'ProfileConfigured'; payload: { username: string } }
  | { type: 'CommunityAdded'; payload: { id: string; name: string } }
  | { type: 'ReflectionSaved'; payload: { dayId: string; communityId: string; text: string } };
export type Command = CommunityCommand | UserCommand;
export interface DomainEvent {
  id: string;
  version: 1;
  type: Command['type'];
  scopeId: string;
  actorId: string;
  recordedAt: string;
  occurredAt: string;
  payload: {
    dayId?: string;
    id?: string;
    title?: string;
    sourceId?: string;
    targetId?: string;
    action?: string;
    rationale?: string;
    authority?: string;
    observedAt?: string;
    [key: string]: unknown;
  };
}
export interface Journal {
  _id: 'journal';
  _rev?: string;
  version: 2;
  events: DomainEvent[];
}
export interface JournalAdapter {
  readJournal(scope: 'user' | 'community', id: string): Promise<Journal | null>;
  append(
    scope: 'user' | 'community',
    id: string,
    journal: Journal | null,
    event: DomainEvent,
  ): Promise<void>;
}
