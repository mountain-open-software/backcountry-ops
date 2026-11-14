import PouchDB from 'pouchdb-browser';
const db = new PouchDB('open-mountain-v1');
export const storage = {
  async all() { return (await db.allDocs({ include_docs: true })).rows.map(row => row.doc); },
  async put(document) { return db.put(document); },
  async remove(document) { return db.remove(document); },
  async seed() {
    const docs = [
      { _id: 'user-local', type: 'user', name: 'Local explorer' },
      { _id: 'org-personal', type: 'organization', name: 'Personal adventures' },
      { _id: 'membership-local', type: 'membership', userId: 'user-local', organizationId: 'org-personal' }
    ];
    for (const doc of docs) {
      try { await db.get(doc._id); } catch (error) {
        if (error.status !== 404) throw error;
        try { await db.put({ ...doc, schemaVersion: 1 }); } catch (conflict) { if (conflict.status !== 409) throw conflict; }
      }
    }
  }
};
