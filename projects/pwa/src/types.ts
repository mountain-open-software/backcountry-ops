import type { CommunityState, UserState, DomainEvent, OperationalDay } from '@open-mountain/domain';
import type { useWorkspace } from './useWorkspace';
export interface WorkspaceData {
  userId: string;
  personal: UserState;
  userEvents: DomainEvent[];
  communityId: string;
  state: CommunityState;
  events: DomainEvent[];
}
export type ReadyWorkspace = Omit<ReturnType<typeof useWorkspace>, 'data'> & {
  data: WorkspaceData;
};
export interface DayProps {
  day: OperationalDay;
  workspace: ReadyWorkspace;
}
export type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
export interface BrowserSpeech {
  processLocally?: boolean;
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeech;
    webkitSpeechRecognition?: new () => BrowserSpeech;
  }
}
