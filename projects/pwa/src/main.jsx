import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createRecord } from '@open-mountain/domain';
import { organizationsForUser, recordsForContext, requireMembership } from '@open-mountain/application';
import { screens, validateScreen } from '@open-mountain/ui-schema';
import { storage } from '@open-mountain/storage-pouchdb';
import './style.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [userId, setUserId] = useState('user-local');
  const [organizationId, setOrganizationId] = useState('org-personal');
  const [tab, setTab] = useState('trip');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const refresh = async () => setDocuments(await storage.all());
  useEffect(() => { storage.seed().then(refresh).then(() => setReady(true)).catch(e => setError(e.message)); }, []);
  const organizations = organizationsForUser(documents, userId);
  const screen = validateScreen(screens[tab]);
  const records = recordsForContext(documents, userId, organizationId, tab);
  async function perform(action) {
    setBusy(true); setError(''); setMessage('');
    try { await action(); await refresh(); } catch (e) { setError(e.message || 'Could not save local data'); }
    finally { setBusy(false); }
  }
  function switchUser(value) {
    setUserId(value);
    setOrganizationId(organizationsForUser(documents, value)[0]?._id || '');
    setMessage('');
  }
  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    await perform(async () => {
      requireMembership(documents, userId, organizationId);
      await storage.put(createRecord(tab, organizationId, userId, fields));
      form.reset(); setMessage('Saved on this device.');
    });
  }
  async function addContext(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await perform(async () => {
      const name = data.name.trim();
      if (!name) throw new Error('Enter a name');
      const id = crypto.randomUUID();
      await storage.put({ _id: id, type: data.kind, name, schemaVersion: 1 });
      if (data.kind === 'organization') {
        await storage.put({ _id: crypto.randomUUID(), type: 'membership', userId, organizationId: id, schemaVersion: 1 });
        setOrganizationId(id);
      }
      form.reset(); setMessage(data.kind === 'user' ? 'Local profile added. Select it above to create an organization.' : 'Organization added for the active user.');
    });
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, documents }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'open-mountain-backup.json'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importData(event) {
    const file = event.target.files[0]; event.target.value = '';
    if (!file) return;
    await perform(async () => {
      const backup = JSON.parse(await file.text());
      if (backup.version !== 1 || !Array.isArray(backup.documents)) throw new Error('Unsupported backup');
      const allowed = ['user', 'organization', 'membership', 'trip', 'daily', 'observation'];
      const ids = new Set();
      for (const doc of backup.documents) {
        if (!doc || typeof doc._id !== 'string' || doc._id.startsWith('_') || ids.has(doc._id) || !allowed.includes(doc.type) || doc.schemaVersion !== 1) throw new Error('Invalid backup record');
        ids.add(doc._id);
        if (['trip','daily','observation'].includes(doc.type) && (typeof doc.title !== 'string' || typeof doc.createdAt !== 'string' || typeof doc.organizationId !== 'string' || typeof doc.authorId !== 'string')) throw new Error('Invalid field record');
      }
      let count = 0;
      const existing = new Set(documents.map(d => d._id));
      for (const doc of backup.documents) {
        if (existing.has(doc._id)) continue;
        const { _rev, ...record } = doc;
        await storage.put(record); count++;
      }
      setMessage(`Imported ${count} new records. Existing records were preserved.`);
    });
  }
  return <div className="shell">
    <header><div className="brand">△ OPEN MOUNTAIN</div><span className="badge">LOCAL ONLY · NO API</span></header>
    <section className="intro"><p className="eyebrow">YOUR BACKCOUNTRY WORKSPACE</p><h1>A good day starts<br/>with a clear plan.</h1><p>Plan your trip, prepare for the day, and record what you find.</p></section>
    {error && <p role="alert" className="error">{error}</p>}
    {message && <p role="status" className="notice">{message}</p>}
    {!ready ? <p role="status">{error ? 'Local storage could not open. Check browser storage permissions and reload.' : 'Opening local workspace…'}</p> : <>
      <section className="context"><label>Local user<select aria-label="Local user" value={userId} onChange={e => switchUser(e.target.value)} disabled={busy}>{documents.filter(d => d.type === 'user').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></label><label>Organization<select aria-label="Organization" value={organizationId} onChange={e => { setOrganizationId(e.target.value); setMessage(''); }} disabled={busy}>{!organizations.length && <option value="">Create an organization below</option>}{organizations.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}</select></label><p>Stored on this device.<br/>No accounts or cloud synchronization.</p></section>
      <nav aria-label="Workflows">{Object.entries(screens).map(([key, value], i) => <button key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => { setTab(key); setMessage(''); }} disabled={busy}><small>0{i + 1}</small>{value.title}</button>)}</nav>
      <main><section className="panel"><p className="eyebrow">PREPARE · CAPTURE · REVIEW</p><h2>{screen.title}</h2><form key={`${tab}-${organizationId}-${userId}`} onSubmit={save}>{screen.fields.map(field => <label key={field.name}>{field.label}{field.kind === 'textarea' ? <textarea name={field.name} rows="3"/> : <input type={field.kind} name={field.name} required={field.required} defaultValue={field.kind === 'date' ? new Date().toLocaleDateString('en-CA') : undefined}/>}</label>)}<button className="primary" disabled={busy || !organizationId}>Save {screen.singular}</button></form></section>
      <section className="records"><div className="section-heading"><h2>Saved locally</h2><span>{records.length} records</span></div>{!records.length && <div className="empty"><span>△</span><h3>Room for your next adventure</h3><p>Saved {screen.singular} records for this organization will appear here.</p></div>}{records.map(record => <article key={record._id}><div className="section-heading"><h3>{record.title}</h3><button className="subtle" disabled={busy} onClick={() => { if (window.confirm(`Delete “${record.title}” from this device?`)) perform(() => storage.remove(record)); }}>Delete</button></div><p className="meta">{record.date || 'No date'} · {documents.find(d => d._id === record.authorId)?.name || 'Local user'}</p>{record.route && <p><strong>Route:</strong> {record.route}</p>}{record.location && <p><strong>Location:</strong> {record.location}</p>}<p className="notes">{record.notes}</p></article>)}</section></main>
      <details className="settings"><summary>Local workspace & backups</summary><p>Local profiles are convenience settings, not authenticated accounts. Browser storage can be cleared; export regular backups. Backups include all local organizations and users.</p><form className="inline" onSubmit={addContext}><select name="kind" aria-label="Create type"><option value="organization">New organization for active user</option><option value="user">New local user</option></select><input name="name" aria-label="Name" placeholder="Name" required/><button disabled={busy}>Add</button></form><form className="inline" onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const selected = new FormData(form).get('organization'); perform(async () => { if (!selected) throw new Error('Select an organization'); if (organizations.some(o => o._id === selected)) throw new Error('Already a member'); await storage.put({ _id: crypto.randomUUID(), type: 'membership', userId, organizationId: selected, schemaVersion: 1 }); setOrganizationId(selected); }); }}><select name="organization" aria-label="Organization to join"><option value="">Link active user to an existing local organization</option>{documents.filter(d => d.type === 'organization').map(o => <option key={o._id} value={o._id}>{o.name}</option>)}</select><button disabled={busy}>Add membership</button></form><div className="inline"><button onClick={exportData} disabled={busy}>Export backup</button><label className="import">Import backup<input type="file" accept="application/json" onChange={importData} disabled={busy}/></label></div><p>Import adds missing records and preserves existing records. It does not replace or merge edits.</p></details>
    </>}
    <footer>Open technology. Independent products. Shared backcountry infrastructure.</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
