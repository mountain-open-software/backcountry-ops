export const recordTypes = ['trip', 'daily', 'observation'];
export function createRecord(type, organizationId, authorId, fields) {
  if (!recordTypes.includes(type)) throw new Error('Unknown record type');
  if (!organizationId || !authorId) throw new Error('Select a user and organization');
  const title = fields.title?.trim();
  if (!title) throw new Error('A title is required');
  return {
    ...fields,
    title,
    _id: crypto.randomUUID(),
    type,
    organizationId,
    authorId,
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
  };
}
export {
  mindsets,
  problemTypes,
  blankDebrief,
  emptyCommunity,
  emptyUser,
  datesBetween,
  dayKey,
  makeEvent,
  applyCommunity,
  applyUser,
  replay,
} from './expedition.js';

export { planLabel, briefingPlans, reorderPlans } from './plans.js';
