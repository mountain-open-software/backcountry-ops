import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecord } from '@open-mountain/domain';
test('record identity and ownership cannot be overridden by form data', () => {
  const record = createRecord('trip', 'a', 'alice', { title: ' Ridge ', organizationId: 'b', authorId: 'bob', type: 'user', _id: 'bad' });
  assert.equal(record.organizationId, 'a'); assert.equal(record.authorId, 'alice');
  assert.equal(record.type, 'trip'); assert.notEqual(record._id, 'bad'); assert.equal(record.title, 'Ridge');
  assert.throws(() => createRecord('trip', 'a', 'alice', { title: ' ' }));
});
