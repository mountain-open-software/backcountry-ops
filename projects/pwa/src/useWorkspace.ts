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
    const personal = await service.read('user', userId);
    if (!personal.state.profile)
      throw new Error(
        'Local profile data is missing. Restore your backup rather than resetting storage.',
      );
    const communityId =
      requestedCommunity || localStorage.getItem(communityKey) || personal.state.communities[0]?.id;
    const chosen =
      personal.state.communities.find((c) => c.id === communityId) || personal.state.communities[0];
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
    if (!chosen || !community) throw new Error('No community configured');
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
  async function createProfile(username: string, communityName: string) {
    const userId = crypto.randomUUID(),
      communityId = crypto.randomUUID();
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
  async function addCommunity(name: string) {
    const id = crypto.randomUUID();
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
    restore,
    storage: workspaceStorage,
    setError,
  };
}
