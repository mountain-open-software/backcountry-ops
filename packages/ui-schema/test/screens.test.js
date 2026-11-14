import test from 'node:test';
import assert from 'node:assert/strict';
import { screens, validateScreen } from '@open-mountain/ui-schema';
test('unsupported renderer versions and component types fail explicitly', () => {
  assert.throws(() => validateScreen({ version: 2, fields: [] }));
  assert.throws(() => validateScreen({ version: 1, fields: [{ kind: 'script' }] }));
});

test('every shipped screen is supported by the renderer contract', () => {
  for (const screen of Object.values(screens)) assert.equal(validateScreen(screen), screen);
});
