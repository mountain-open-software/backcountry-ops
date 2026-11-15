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
