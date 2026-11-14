export function organizationsForUser(documents, userId) {
  const ids = new Set(documents.filter(d => d.type === 'membership' && d.userId === userId).map(d => d.organizationId));
  return documents.filter(d => d.type === 'organization' && ids.has(d._id));
}
export function recordsForContext(documents, userId, organizationId, type) {
  if (!organizationsForUser(documents, userId).some(o => o._id === organizationId)) return [];
  return documents.filter(d => d.type === type && d.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function requireMembership(documents, userId, organizationId) {
  if (!organizationsForUser(documents, userId).some(o => o._id === organizationId)) throw new Error('User is not a member of this organization');
}
