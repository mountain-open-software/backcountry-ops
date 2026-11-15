/** Labels describe priority; stable IDs preserve plan identity when order changes. */
export function planLabel(index) {
  let value = index + 1,
    label = '';
  while (value > 0) {
    value--;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}
/** Read legacy events/drafts without rewriting their original evidence. */
export function briefingPlans(briefing) {
  if (briefing && Object.hasOwn(briefing, 'plans')) return briefing.plans;
  return [
    { id: 'legacy-plan-a', description: briefing?.planA || '', hazards: briefing?.hazardsA || '' },
    { id: 'legacy-plan-b', description: briefing?.planB || '', hazards: briefing?.hazardsB || '' },
  ];
}
export function reorderPlans(plans, from, to) {
  if (from < 0 || to < 0 || from >= plans.length || to >= plans.length) return plans;
  const result = [...plans];
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}
