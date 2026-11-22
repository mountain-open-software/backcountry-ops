import { useEffect, useSyncExternalStore } from 'react';
import { localAI } from './localAI';
export function useLocalAI(enabled: boolean) {
  const state = useSyncExternalStore(localAI.subscribe, localAI.getSnapshot, localAI.getSnapshot);
  useEffect(() => {
    void localAI.configure(enabled);
    void localAI.inspect();
  }, [enabled]);
  return { ...state, controller: localAI };
}
