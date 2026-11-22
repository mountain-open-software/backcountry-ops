import { emptyCommunity, emptyUser, makeEvent, replay } from '@open-mountain/domain';

// The adapter owns durable append. Every command validates against its latest journal revision.
export function createWorkspace(storage, options = {}) {
  const createId = options.createId || (() => globalThis.crypto.randomUUID());
  const now = options.now || (() => new Date().toISOString());
  return {
    async read(scope, id) {
      const journal = await storage.readJournal(scope, id);
      return {
        journal,
        state: journal
          ? replay(journal.events, scope)
          : scope === 'user'
            ? emptyUser()
            : emptyCommunity(),
      };
    },
    async reconcileCommunities(userId) {
      let personal = await this.read('user', userId);
      for (const membership of personal.state.communities.filter((c) => !c.removedAt)) {
        const community = await this.read('community', membership.id);
        if (community.state.community?.deletedAt)
          personal = await this.dispatch('user', userId, userId, {
            type: 'CommunityRemoved',
            payload: { id: membership.id },
          });
        else if (community.state.community && community.state.community.name !== membership.name)
          personal = await this.dispatch('user', userId, userId, {
            type: 'CommunityUpdated',
            payload: { id: membership.id, name: community.state.community.name },
          });
      }
      return personal;
    },
    async renameCommunity(userId, id, name) {
      const personal = await this.read('user', userId);
      if (!personal.state.communities.some((c) => c.id === id && !c.removedAt))
        throw new Error('Choose an active community');
      await this.dispatch('community', id, userId, {
        type: 'CommunityRenamed',
        payload: { name: name.trim() },
      });
      await this.reconcileCommunities(userId);
    },
    async deleteCommunity(userId, id) {
      const personal = await this.read('user', userId);
      if (!personal.state.communities.some((c) => c.id === id && !c.removedAt))
        throw new Error('Choose an active community');
      const community = await this.read('community', id);
      if (!community.state.community?.deletedAt)
        await this.dispatch('community', id, userId, { type: 'CommunityDeleted', payload: {} });
      await this.reconcileCommunities(userId);
    },
    async dispatch(scope, id, actorId, command, commandId = createId()) {
      const { journal, state } = await this.read(scope, id);
      const existing = journal?.events.find((event) => event.id === commandId);
      if (existing) {
        if (
          existing.type !== command.type ||
          JSON.stringify(existing.payload) !== JSON.stringify(command.payload || {})
        )
          throw new Error('Command ID already belongs to a different action');
        return this.read(scope, id);
      }
      const event = makeEvent(state, command, {
        actorId,
        scopeId: id,
        now: now(),
        eventId: commandId,
      });
      await storage.append(scope, id, journal, event);
      return this.read(scope, id);
    },
  };
}
