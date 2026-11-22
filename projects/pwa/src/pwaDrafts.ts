// Keep mounted draft writes settled before an explicit app update reload.
interface DraftSession {
  flush: () => Promise<unknown>;
  getSnapshot: () => { status: string };
}
const sessions = new Set<DraftSession>();
export function trackDraft(session: DraftSession) {
  sessions.add(session);
  return () => {
    sessions.delete(session);
  };
}
export async function settleDrafts() {
  await Promise.all([...sessions].map((session) => session.flush()));
  if (
    [...sessions].some((session) =>
      ['loading', 'saving', 'error'].includes(session.getSnapshot().status),
    )
  )
    throw new Error('A draft is still saving or could not be saved. Resolve it before updating.');
}
