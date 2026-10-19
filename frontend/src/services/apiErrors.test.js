import assert from 'node:assert/strict'
import test from 'node:test'
import { getApiErrorInfo } from './apiErrors.js'

test('network failures are distinct from HTTP failures', () => {
  assert.deepEqual(getApiErrorInfo(null, '/api/plans', null, { network: true }), {
    category: 'network',
    message: 'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.',
  })
  assert.equal(getApiErrorInfo(500, '/api/plans').category, 'server')
})

test('validation errors preserve safe backend guidance for 400 and 422', () => {
  for (const status of [400, 422]) {
    assert.equal(
      getApiErrorInfo(status, '/api/members', { field: 'nom', message: 'est obligatoire.' }).message,
      'Champ « nom » : est obligatoire.',
    )
  }
  assert.match(getApiErrorInfo(422, '/api/members').message, /Vérifiez les champs/)
})

test('authentication and authorization responses have distinct user messages', () => {
  assert.match(getApiErrorInfo(401, '/api/auth/login').message, /Adresse e-mail ou mot de passe incorrect/)
  assert.match(getApiErrorInfo(401, '/api/profile').message, /session a expiré/)
  assert.equal(getApiErrorInfo(403, '/api/members').category, 'authorization')
})

test('server errors never expose backend details', () => {
  const error = getApiErrorInfo(500, '/api/members', { message: 'SQL exception: SELECT * FROM users' })
  assert.equal(error.category, 'server')
  assert.match(error.message, /Réessayez dans quelques instants/)
})

test('sensitive or technical client-error details are replaced with safe guidance', () => {
  assert.match(getApiErrorInfo(400, '/api/auth', { message: 'Invalid password token: secret' }).message, /Vérifiez les champs/)
  assert.equal(getApiErrorInfo(409, '/api/members', { message: 'Cette adresse est déjà utilisée.' }).message, 'Cette adresse est déjà utilisée.')
})

test('validation field names are included when the backend supplies one', () => {
  assert.equal(
    getApiErrorInfo(400, '/api/members', { field: 'email', message: 'Adresse invalide.' }).message,
    'Champ « email » : Adresse invalide.',
  )
})