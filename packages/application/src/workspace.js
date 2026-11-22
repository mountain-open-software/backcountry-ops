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
    async applyAssistantProposal(proposal, context) {
      if (
        proposal.error ||
        !proposal.actions?.length ||
        proposal.userId !== context.userId ||
        proposal.communityId !== context.communityId ||
        proposal.dayId !== (context.dayId || null)
      )
        throw new Error('Review notes again for the selected community and day.');
      if (new Set(proposal.actions.map((action) => action.id)).size !== proposal.actions.length)
        throw new Error('Assistant event IDs must be unique');
      const allowed = new Set([
        'TripCreated',
        'BriefingSaved',
        'ObservationRecorded',
        'DebriefSaved',
      ]);
      for (const action of proposal.actions) {
        if (
          action.scope === 'user'
            ? action.command.type !== 'ReflectionSaved' ||
              action.command.payload.communityId !== context.communityId
            : action.scope !== 'community' || !allowed.has(action.command.type)
        )
          throw new Error('Unsupported assistant action');
        if (action.command.type !== 'TripCreated' && action.command.payload.dayId !== context.dayId)
          throw new Error('Assistant context changed');
      }
      // Verify every scope before any write. Retries recognize their own recorded event IDs.
      const verify = async (scope) => {
        const id = scope === 'user' ? context.userId : context.communityId;
        const record = await this.read(scope, id),
          base = scope === 'user' ? proposal.personalRevision : proposal.communityRevision;
        const own = new Set(proposal.actions.filter((a) => a.scope === scope).map((a) => a.id));
        if (
          !Number.isInteger(base) ||
          record.state.revision < base ||
          (record.journal?.events || []).slice(base).some((e) => !own.has(e.id))
        )
          throw new Error('Data changed since these notes were processed. Review them again.');
        return { record, id };
      };
      await verify('community');
      await verify('user');
      for (const action of proposal.actions) {
        const { record, id } = await verify(action.scope);
        const existing = record.journal?.events.find((e) => e.id === action.id);
        if (existing) {
          if (
            existing.type !== action.command.type ||
            JSON.stringify(existing.payload) !== JSON.stringify(action.command.payload)
          )
            throw new Error('Conflicting assistant event');
          continue;
        }
        const event = makeEvent(record.state, action.command, {
          actorId: context.userId,
          scopeId: id,
          eventId: action.id,
          now: now(),
        });
        await storage.append(action.scope, id, record.journal, event);
      }
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
