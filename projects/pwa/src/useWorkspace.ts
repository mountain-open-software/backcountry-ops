import { emptyCommunity, validateIdentifier } from '@open-mountain/domain';
import type { CommunityCommand, UserCommand } from '@open-mountain/domain';
import type { WorkspaceData } from './types';
import { useCallback, useEffect, useState } from 'react';
import { createWorkspace } from '@open-mountain/application';
import { workspaceStorage } from '@open-mountain/storage-pouchdb';
const service = createWorkspace(workspaceStorage);
const profileKey = 'open-mountain-active-user-v2',
  communityKey = 'open-mountain-active-community-v2';
export function useWorkspace() {
  const [data, setData] = useState<WorkspaceData | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const refresh = useCallback(async (requestedCommunity?: string) => {
    const userId = localStorage.getItem(profileKey);
    if (!userId) {
      setData(null);
      return;
    }
    const personal = await service.reconcileCommunities(userId);
    if (!personal.state.profile)
      throw new Error(
        'Local profile data is missing. Restore your backup rather than resetting storage.',
      );
    const communityId =
      requestedCommunity ||
      localStorage.getItem(communityKey) ||
      personal.state.communities.find((c) => !c.removedAt)?.id;
    const chosen =
      personal.state.communities.find((c) => c.id === communityId && !c.removedAt) ||
      personal.state.communities.find((c) => !c.removedAt);
    let community;
    if (chosen) {
      community = await service.read('community', chosen.id);
      if (!community.state.community)
        community = await service.dispatch('community', chosen.id, userId, {
          type: 'CommunityCreated',
          payload: { name: chosen.name },
        });
      localStorage.setItem(communityKey, chosen.id);
    }
    if (!chosen || !community) {
      localStorage.removeItem(communityKey);
      setData({
        userId,
        personal: personal.state,
        userEvents: personal.journal?.events || [],
        communityId: '',
        state: emptyCommunity(),
        events: [],
      });
      return;
    }
    setData({
      userId,
      personal: personal.state,
      userEvents: personal.journal?.events || [],
      communityId: chosen.id,
      state: community.state,
      events: community.journal?.events || [],
    });
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    const focus = () => refresh().catch((e) => setError(e.message));
    window.addEventListener('focus', focus);
    return () => window.removeEventListener('focus', focus);
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
      setError(
        e instanceof Error
          ? e.message
          : 'Local storage operation failed. Your last saved records are preserved.',
      );
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
  async function createProfile(username: string, communityName: string, communityId: string) {
    validateIdentifier(username, 'Username', 80);
    await checkCommunity(communityName, communityId);
    const userId = crypto.randomUUID();
    await service.dispatch('user', userId, userId, {
      type: 'ProfileConfigured',
      payload: { username },
    });
    await service.dispatch('user', userId, userId, {
      type: 'CommunityAdded',
      payload: { id: communityId, name: communityName },
    });
    await service.dispatch('community', communityId, userId, {
      type: 'CommunityCreated',
      payload: { name: communityName },
    });
    localStorage.setItem(profileKey, userId);
    localStorage.setItem(communityKey, communityId);
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
    localStorage.setItem(communityKey, id);
  }
  async function restore(backup: unknown) {
    const userId = await workspaceStorage.restoreBackup(backup, data?.userId);
    localStorage.setItem(profileKey, userId);
    localStorage.removeItem(communityKey);
  }
  return {
    data,
    loading,
    busy,
    error,
    message,
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
    restore,
    storage: workspaceStorage,
    setError,
  };
}
