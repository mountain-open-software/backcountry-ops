import test from 'node:test';
import assert from 'node:assert/strict';
import { organizationsForUser, recordsForContext, requireMembership } from '@open-mountain/application';
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
