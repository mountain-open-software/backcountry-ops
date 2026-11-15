// Drafts are user-owned staging data, never approvals, submissions, or domain events.
export function createDraftSession(storage, userId, key, initialValue) {
  let snapshot = { value: initialValue, status: 'loading', recovered: false, error: '' };
  let revision = 0,
    generation = 0;
  let hydrationError = null;
  const listeners = new Set();
  const publish = (patch) => {
    snapshot = { ...snapshot, ...patch };
    for (const listener of listeners) listener();
  };
  const failure = (error) =>
    publish({ status: 'error', error: error instanceof Error ? error.message : String(error) });
  const ready = storage
    .readDraft(userId, key)
    .then((record) => {
      revision = record?.revision || 0;
      if (generation === 0)
        publish({
          value: record?.value ?? initialValue,
          status: record?.value != null ? 'recovered' : 'clean',
          recovered: record?.value != null,
        });
      else publish({ status: 'saving' });
    })
    .catch((error) => {
      hydrationError = error;
      failure(error);
      throw error;
    });
  // Never overwrite an unread draft after a failed hydration.
  let pending = ready.catch(() => {});
  let hydrated = false;
  ready
    .then(() => {
      hydrated = true;
    })
    .catch(() => {});
  function enqueue(value, expectedGeneration) {
    pending = pending.then(async () => {
      if (!hydrated) return;
      try {
        const result = await storage.writeDraft(userId, key, value, revision);
        revision = result.revision;
        if (generation === expectedGeneration)
          publish({ status: value === null ? 'clean' : 'saved', error: '', recovered: false });
      } catch (error) {
        failure(error);
      }
    });
    return pending;
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      const value = typeof next === 'function' ? next(snapshot.value) : next;
      generation++;
      if (hydrationError) {
        publish({ value });
        failure(hydrationError);
        return;
      }
      publish({ value, status: 'saving', error: '' });
      enqueue(value, generation);
    },
    clear() {
      const at = generation;
      pending = pending.then(async () => {
        if (!hydrated || at !== generation) return;
        try {
          const result = await storage.writeDraft(userId, key, null, revision);
          revision = result.revision;
          if (at === generation) publish({ status: 'clean', recovered: false, error: '' });
        } catch (error) {
          failure(error);
        }
      });
      return pending;
    },
    reset(value) {
      generation++;
      publish({ value, status: 'saving', recovered: false, error: '' });
      return this.clear();
    },
    flush: () => pending,
    ready,
  };
}
