// Backend role values are canonical. The aliases keep existing UI labels and cached sessions compatible.
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
})

const roleAliases = Object.freeze({
  ADMIN: ROLES.ADMIN,
  RECEPTIONIST: ROLES.RECEPTIONIST,
  RECEPTION: ROLES.RECEPTIONIST,
  TRAINER: ROLES.TRAINER,
  COACH: ROLES.TRAINER,
  MEMBER: ROLES.MEMBER,
  MEMBRE: ROLES.MEMBER,
})

export const FEATURES = Object.freeze({
  MANAGE_MEMBERS: 'MANAGE_MEMBERS',
  VIEW_OWN_MEMBER_RECORD: 'VIEW_OWN_MEMBER_RECORD',
  VIEW_OWN_BOOKINGS: 'VIEW_OWN_BOOKINGS',
  HANDLE_COACH_REQUESTS: 'HANDLE_COACH_REQUESTS',
  VIEW_MEMBER_REQUESTS: 'VIEW_MEMBER_REQUESTS',
})

const featureRoles = Object.freeze({
  [FEATURES.MANAGE_MEMBERS]: [ROLES.ADMIN, ROLES.RECEPTIONIST],
  [FEATURES.VIEW_OWN_MEMBER_RECORD]: [ROLES.MEMBER],
  [FEATURES.VIEW_OWN_BOOKINGS]: [ROLES.MEMBER],
  [FEATURES.HANDLE_COACH_REQUESTS]: [ROLES.TRAINER],
  [FEATURES.VIEW_MEMBER_REQUESTS]: [ROLES.MEMBER],
})

const roleDefinitions = Object.freeze({
  [ROLES.ADMIN]: {
    routeKey: 'admin',
    homePath: '/admin/dashboard',
    profilePath: '/admin/profile',
    label: 'admin',
    navigation: [
      { to: '/admin/dashboard', key: 'dashboard' }, { to: '/admin/activity', key: 'activity' }, { to: '/admin/members', key: 'members' }, { to: '/admin/schedule', key: 'schedule' }, { to: '/admin/trainer-bookings', key: 'trainerBookings' }, { to: '/admin/plans', key: 'managePlans' }, { to: '/admin/face-recognition', key: 'faceRecognition' },
    ],
  },
  [ROLES.RECEPTIONIST]: {
    routeKey: 'reception',
    homePath: '/reception/accueil',
    profilePath: '/reception/profil',
    label: 'reception',
    navigation: [
      { to: '/reception/accueil', key: 'home' }, { to: '/reception/planning', key: 'schedule' }, { to: '/admin/plans', key: 'managePlans' }, { to: '/reception/face-recognition', key: 'faceRecognition' },
    ],
  },
  [ROLES.TRAINER]: {
    routeKey: 'coach',
    homePath: '/coach/planning',
    profilePath: '/coach/profil',
    label: 'coach',
    navigation: [
      { to: '/coach/planning', key: 'schedule' }, { to: '/coach/clients', key: 'members' }, { to: '/coach/requests', key: 'coachingRequests' },
    ],
  },
  [ROLES.MEMBER]: {
    routeKey: 'membre',
    homePath: '/membre/dashboard',
    profilePath: '/membre/profile',
    label: 'member',
    navigation: [
      { to: '/membre/dashboard', key: 'status' }, { to: '/membre/membership', key: 'subscription' }, { to: '/membre/bookings', key: 'bookings' }, { to: '/membre/trainer-sessions', key: 'trainerSessions' }, { to: '/membre/coaching', key: 'coachingRequests' }, { to: '/membre/progress', key: 'progress' }, { to: '/membre/face-recognition', key: 'faceRecognition' },
    ],
  },
})

const protectedRoutePatterns = Object.freeze(Object.fromEntries(
  Object.entries(roleDefinitions).map(([role, definition]) => [
    role,
    new RegExp(`^/${definition.routeKey}(?:/|$)`),
  ]),
))

const sharedRouteRoles = Object.freeze({
  '/admin/plans': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  '/membership/setup': [ROLES.MEMBER],
})

export function normalizeRole(role) {
  if (typeof role !== 'string') return null
  return roleAliases[role.trim().toUpperCase()] || null
}

export function getCurrentRole(user) {
  return normalizeRole(user?.role)
}

export function hasRole(userOrRole, allowedRoles) {
  const role = typeof userOrRole === 'object' && userOrRole !== null
    ? getCurrentRole(userOrRole)
    : normalizeRole(userOrRole)
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return role !== null && allowed.some((candidate) => normalizeRole(candidate) === role)
}

export function canAccessFeature(user, feature) {
  const allowedRoles = featureRoles[feature]
  return Boolean(allowedRoles && hasRole(user, allowedRoles))
}

export function canAccessRoute(user, pathname) {
  const role = getCurrentRole(user)
  const sharedRoles = sharedRouteRoles[pathname]
  if (sharedRoles) return hasRole(role, sharedRoles)
  return Boolean(role && protectedRoutePatterns[role]?.test(pathname))
}

export function getRoleDefinition(role) {
  return roleDefinitions[normalizeRole(role)] || null
}

export function getHomePath(user) {
  return getRoleDefinition(getCurrentRole(user))?.homePath || null
}