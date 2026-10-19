export function staffListPath(searchParams = new URLSearchParams()) {
  const query = searchParams.toString()
  return `/admin/staff${query ? `?${query}` : ''}`
}

export function staffDetailsPath(id) {
  return `/admin/staff/${encodeURIComponent(id)}`
}

export function staffRoleLabelKey(role) {
  return role === 'TRAINER' ? 'trainerRole' : 'receptionistRole'
}

export function staffRoleFilter(value) {
  return value === 'TRAINER' || value === 'RECEPTIONIST' ? value : 'ALL'
}
