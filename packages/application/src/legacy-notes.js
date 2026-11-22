// Stable migration IDs; a differing source with the same ID is rejected by the store.
function hash(text, seed) {
  let value = seed;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  return (value >>> 0).toString(16).padStart(8, '0');
}
export function legacyAssistantNotes(history, communityId, dayId, context) {
  return history.flatMap((entry, index) => {
    if (entry.role !== 'You' || typeof entry.text !== 'string' || !entry.text.trim()) return [];
    const source = `${communityId}:${dayId || 'planning'}:${index}:${entry.text}`;
    return [
      {
        id: `legacy-${hash(source, 2166136261)}${hash(source, 2654435761)}`,
        text: entry.text,
        communityId,
        ...(dayId ? { dayId } : {}),
        context,
      },
    ];
  });
}
