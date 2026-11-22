import { emptyCommunity, validateIdentifier } from '@open-mountain/domain';
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
    const personal = await service.reconcileCommunities(identity.userId);
    if (!personal.state.profile)
      throw new Error('Profile is missing. Restore your backup rather than resetting storage.');
    const chosen =
      personal.state.communities.find(
        (c) => c.id === (communityId || identity.communityId) && !c.removedAt,
      ) || personal.state.communities.find((c) => !c.removedAt);
    if (!chosen) {
      await writeIdentity(identity.userId);
      setData({
        userId: identity.userId,
        personal: personal.state,
        communityId: '',
        state: emptyCommunity(),
        events: [],
      });
      return;
    }
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
  async function checkCommunity(name: string, id: string) {
    validateIdentifier(id, 'Community ID');
    if (!name.trim() || name.length > 100)
      throw new Error('Community name must be 1–100 characters');
    const existing = await service.read('community', id);
    if (existing.state.community)
      throw new Error('A community with this ID already exists. Choose another ID.');
  }
  async function createProfile(username: string, name: string, id: string) {
    validateIdentifier(username, 'Username', 80);
    await checkCommunity(name, id);
    const userId = randomUUID();
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
  async function addCommunity(name: string, id: string) {
    await checkCommunity(name, id);
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
    recordAssistantNote: async (
      payload: Extract<UserCommand, { type: 'AssistantNoteRecorded' }>['payload'],
    ) => {
      const existing = (await service.read('user', data!.userId)).state.assistantNotes?.[
        payload.id
      ];
      if (existing && existing.text !== payload.text)
        throw new Error('Conflicting note ID; original note preserved');
      if (!existing) await personalCommand('AssistantNoteRecorded', payload);
      await refresh();
    },
    updateAssistantNote: async (
      payload: Extract<UserCommand, { type: 'AssistantNoteUpdated' }>['payload'],
    ) => {
      await personalCommand('AssistantNoteUpdated', payload);
      await refresh();
    },
    applyAssistantProposal: (
      proposal: import('@open-mountain/application').AssistantProposal,
      dayId?: string,
    ) =>
      service.applyAssistantProposal(proposal, {
        userId: data!.userId,
        communityId: data!.communityId,
        dayId,
      }),
    renameCommunity: (id: string, name: string) => service.renameCommunity(data!.userId, id, name),
    deleteCommunity: (id: string) => service.deleteCommunity(data!.userId, id),
    storage: nativeStorage,
  };
}
export type ReadyWorkspace = Omit<ReturnType<typeof useWorkspace>, 'data'> & { data: NativeData };
