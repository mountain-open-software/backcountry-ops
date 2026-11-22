import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { createWorkspace } from '@open-mountain/application';
import type {
  CommunityCommand,
  UserCommand,
  CommunityState,
  UserState,
  DomainEvent,
} from '@open-mountain/domain';
import { nativeStorage, readIdentity, writeIdentity } from './nativeStorage';
const service = createWorkspace(nativeStorage, { createId: randomUUID });
export interface NativeData {
  userId: string;
  communityId: string;
  personal: UserState;
  state: CommunityState;
  events: DomainEvent[];
}
export function useWorkspace() {
  const [data, setData] = useState<NativeData | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const refresh = useCallback(async (communityId?: string) => {
    const identity = await readIdentity();
    if (!identity) {
      setData(null);
      return;
    }
    const personal = await service.read('user', identity.userId);
    if (!personal.state.profile)
      throw new Error('Profile is missing. Restore your backup rather than resetting storage.');
    const chosen =
      personal.state.communities.find((c) => c.id === (communityId || identity.communityId)) ||
      personal.state.communities[0];
    if (!chosen) throw new Error('No community configured');
    let community = await service.read('community', chosen.id);
    if (!community.state.community)
      community = await service.dispatch('community', chosen.id, identity.userId, {
        type: 'CommunityCreated',
        payload: { name: chosen.name },
      });
    await writeIdentity(identity.userId, chosen.id);
    setData({
      userId: identity.userId,
      communityId: chosen.id,
      personal: personal.state,
      state: community.state,
      events: community.journal?.events || [],
    });
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(String(e.message)))
      .finally(() => setLoading(false));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh().catch((e) => setError(String(e.message)));
    });
    return () => sub.remove();
  }, [refresh]);
  async function run(action: () => Promise<unknown>, success?: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await refresh();
      if (success) setMessage(success);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function createProfile(username: string, name: string) {
    const userId = randomUUID(),
      id = randomUUID();
    await service.dispatch('user', userId, userId, {
      type: 'ProfileConfigured',
      payload: { username },
    });
    await service.dispatch('user', userId, userId, {
      type: 'CommunityAdded',
      payload: { id, name },
    });
    await service.dispatch('community', id, userId, {
      type: 'CommunityCreated',
      payload: { name },
    });
    await writeIdentity(userId, id);
  }
  const command = <T extends CommunityCommand['type']>(
    type: T,
    payload: Extract<CommunityCommand, { type: T }>['payload'],
  ) =>
    service.dispatch('community', data!.communityId, data!.userId, {
      type,
      payload,
    } as CommunityCommand);
  const personalCommand = <T extends UserCommand['type']>(
    type: T,
    payload: Extract<UserCommand, { type: T }>['payload'],
  ) => service.dispatch('user', data!.userId, data!.userId, { type, payload } as UserCommand);
  async function addCommunity(name: string) {
    const id = randomUUID();
    await personalCommand('CommunityAdded', { id, name });
    await service.dispatch('community', id, data!.userId, {
      type: 'CommunityCreated',
      payload: { name },
    });
    await writeIdentity(data!.userId, id);
  }
  return {
    data,
    loading,
    busy,
    error,
    message,
    setError,
    run,
    refresh,
    createProfile,
    command,
    personalCommand,
    addCommunity,
    storage: nativeStorage,
  };
}
export type ReadyWorkspace = Omit<ReturnType<typeof useWorkspace>, 'data'> & { data: NativeData };
