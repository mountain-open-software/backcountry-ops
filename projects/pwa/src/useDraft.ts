import { useMemo, useSyncExternalStore } from 'react';
import { createDraftSession, type DraftStore } from '@open-mountain/application';
export function useDraft<T>(storage: DraftStore, userId: string, key: string, initial: T) {
  const session = useMemo(
    () => createDraftSession(storage, userId, key, initial),
    [storage, userId, key],
  );
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  return [snapshot.value, session.set, snapshot, session] as const;
}
