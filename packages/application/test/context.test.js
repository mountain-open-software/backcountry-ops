import test from 'node:test';
import assert from 'node:assert/strict';
import { organizationsForUser, recordsForContext, requireMembership } from '../src/index.js';
import { createRecord } from '../../domain/src/index.js';
import { validateScreen } from '../../ui-schema/src/index.js';
const documents = [
  { _id: 'a', type: 'organization' }, { _id: 'b', type: 'organization' },
  { type: 'membership', userId: 'alice', organizationId: 'a' },
  { type: 'membership', userId: 'alice', organizationId: 'b' },
  { type: 'membership', userId: 'bob', organizationId: 'b' },
  { _id: 'trip-a', type: 'trip', organizationId: 'a', createdAt: '2026-01-01' },
  { _id: 'trip-b', type: 'trip', organizationId: 'b', createdAt: '2026-01-02' }
];
test('a user can belong to multiple organizations', () => {
  assert.deepEqual(organizationsForUser(documents, 'alice').map(o => o._id), ['a', 'b']);
});
test('switching context only returns that organization’s records', () => {
  assert.deepEqual(recordsForContext(documents, 'alice', 'a', 'trip').map(r => r._id), ['trip-a']);
  assert.deepEqual(recordsForContext(documents, 'alice', 'b', 'trip').map(r => r._id), ['trip-b']);
});
test('non-members cannot read or write through application context', () => {
  assert.deepEqual(recordsForContext(documents, 'bob', 'a', 'trip'), []);
  assert.throws(() => requireMembership(documents, 'bob', 'a'));
});
test('record identity and ownership cannot be overridden by form data', () => {
  const record = createRecord('trip', 'a', 'alice', { title: ' Ridge ', organizationId: 'b', authorId: 'bob', type: 'user', _id: 'bad' });
  assert.equal(record.organizationId, 'a'); assert.equal(record.authorId, 'alice');
  assert.equal(record.type, 'trip'); assert.notEqual(record._id, 'bad'); assert.equal(record.title, 'Ridge');
  assert.throws(() => createRecord('trip', 'a', 'alice', { title: ' ' }));
});
test('unsupported renderer versions and component types fail explicitly', () => {
  assert.throws(() => validateScreen({ version: 2, fields: [] }));
  assert.throws(() => validateScreen({ version: 1, fields: [{ kind: 'script' }] }));
});
