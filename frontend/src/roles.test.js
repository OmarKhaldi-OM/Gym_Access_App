import assert from 'node:assert/strict'
import test from 'node:test'
import { canAccessRoute, getHomePath, normalizeRole } from './roles.js'

const routeKeys = [
  ['ADMIN', '/admin/dashboard'],
  ['RECEPTIONIST', '/reception/accueil'],
  ['TRAINER', '/coach/planning'],
  ['MEMBER', '/membre/dashboard'],
]

test('normalizes canonical roles and retained UI aliases', () => {
  assert.equal(normalizeRole(' receptionist '), 'RECEPTIONIST')
  assert.equal(normalizeRole('reception'), 'RECEPTIONIST')
  assert.equal(normalizeRole('coach'), 'TRAINER')
  assert.equal(normalizeRole('membre'), 'MEMBER')
  assert.equal(normalizeRole('unknown'), null)
})

test('allows each role only within its route key and sends it to its home route', () => {
  for (const [role, path] of routeKeys) {
    assert.equal(canAccessRoute({ role }, path), true)
    assert.equal(getHomePath({ role }), path)
    for (const [otherRole, otherPath] of routeKeys) {
      if (otherRole !== role) assert.equal(canAccessRoute({ role }, otherPath), false)
    }
  }
})

test('allows only admin and receptionist to manage membership plans', () => {
  assert.equal(canAccessRoute({ role: 'ADMIN' }, '/admin/plans'), true)
  assert.equal(canAccessRoute({ role: 'RECEPTIONIST' }, '/admin/plans'), true)
  assert.equal(canAccessRoute({ role: 'TRAINER' }, '/admin/plans'), false)
  assert.equal(canAccessRoute({ role: 'MEMBER' }, '/admin/plans'), false)
})
