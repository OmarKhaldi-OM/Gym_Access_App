import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

test('member summaries recognize the canonical ACTIVE subscription status', () => {
  const source = readSource('./services/memberService.js')
  assert.match(source, /subscription\?\.statut\?\.toUpperCase\(\) === 'ACTIVE'/)
})

test('class reservations use canonical CONFIRMED and CANCELLED statuses', () => {
  const source = readSource('./services/classService.js')
  assert.match(source, /statut: booking\.statut\?\.toUpperCase\(\) === 'CANCELLED' \? 'CANCELLED' : 'CONFIRMED'/)
  assert.match(source, /statut: 'CONFIRMED'/)
  assert.doesNotMatch(source, /CONFIRMEE|ANNULEE|annulee|confirmee/)
})

test('face enrollment reports the caught API error without reading response out of scope', () => {
  const source = readSource('./pages/FaceRecognitionPage.jsx')
  const handler = source.match(/async function handleEnroll\(\) \{([\s\S]*?)\n  \}/)
  assert.ok(handler, 'handleEnroll should exist')
  const catchBlock = handler[1].match(/} catch \(error\) \{([\s\S]*?)\n    \} finally \{/)
  assert.ok(catchBlock, 'handleEnroll should have an error handler')
  assert.doesNotMatch(catchBlock[1], /\bresponse\b/)
  assert.match(catchBlock[1], /message:\s*error\?\.message/)
})

test('each additional translation catalog defines coachingRequests once', () => {
  const source = readSource('./context/I18nContext.jsx')
  const additionalMessages = source.slice(
    source.indexOf('const additionalMessages'),
    source.indexOf('const dictionaries'),
  )
  const expectedTranslations = {
    en: 'Coaching requests',
    fr: 'Demandes de coaching',
    ar: 'طلبات التدريب',
  }

  for (const [language, translation] of Object.entries(expectedTranslations)) {
    const section = additionalMessages.match(
      new RegExp(`${language}: \\{([\\s\\S]*?)(?=\\n  (?:${Object.keys(expectedTranslations).filter((item) => item !== language).join('|')}): \\{|$)`),
    )
    assert.ok(section, `missing ${language} catalog`)
    assert.equal((section[1].match(/coachingRequests:/g) || []).length, 1)
    assert.ok(section[1].includes(`coachingRequests: '${translation}'`))
  }
})

test('theme follows the browser preference unless manually overridden in the current session', () => {
  const source = readSource('./context/ThemeContext.jsx')

  assert.match(source, /window\.matchMedia\?\.\('\(prefers-color-scheme: dark\)'\)/)
  assert.match(source, /mediaQuery\.addEventListener\('change', handlePreferenceChange\)/)
  assert.match(source, /if \(!hasManualOverride\.current\)/)
  assert.match(source, /hasManualOverride\.current = true/)
  assert.doesNotMatch(source, /localStorage/)
})

test('initial browser preference is applied before the application module loads', () => {
  const source = readSource('../index.html')

  assert.match(source, /window\.matchMedia\?\.\('\(prefers-color-scheme: dark\)'\)/)
  assert.ok(source.indexOf('<script>') < source.indexOf('<script type="module"'))
})

test('sign-in autofill keeps the normal input background in both themes', () => {
  const source = readSource('./index.css')

  assert.match(source, /\.signin-page \.auth-form input:-webkit-autofill/)
  assert.match(source, /-webkit-box-shadow: 0 0 0 1000px rgba\(255, 255, 255, \.48\) inset/)
  assert.match(source, /\[data-theme='dark'\] \.signin-page \.auth-form input:-webkit-autofill/)
  assert.match(source, /-webkit-box-shadow: 0 0 0 1000px var\(--surface-soft\) inset/)
  assert.match(source, /-webkit-text-fill-color: var\(--ink\)/)
})

test('trainer sessions imports the empty state used when there are no sessions', () => {
  const source = readSource('./pages/member/MyTrainerSessions.jsx')

  assert.match(source, /import \{ ApiEmpty, ApiError, ApiLoading \} from '\.\.\/\.\.\/components\/ApiState\.jsx'/)
  assert.match(source, /<ApiEmpty message=\{t\('noSessions'\)\} \/>/)
})

test('admin cannot select account face enrollment from the face recognition page', () => {
  const source = readSource('./pages/FaceRecognitionPage.jsx')

  assert.match(source, /const isAdmin = hasRole\(user, ROLES\.ADMIN\)/)
  assert.match(source, /\{!isAdmin && \(\s*<Button[\s\S]*?Enroll my sign-in face/)
})

test('member deletion anonymizes through the admin profile action and retains access logs', () => {
  const memberService = readSource('./services/memberService.js')
  const memberProfile = readSource('./pages/admin/MemberProfile.jsx')
  const memberServiceBackend = readSource('../../backend/src/main/java/com/example/gym_app/user/service/MemberService.java')

  assert.match(memberService, /apiDelete\(`\/api\/members\/\$\{id\}`\)/)
  assert.match(memberProfile, /memberService\.deleteMember\(id\)/)
  assert.match(memberProfile, /removeMember\(id\)/)
  assert.match(memberServiceBackend, /member\.setArchived\(true\)/)
  assert.match(memberServiceBackend, /member\.setNom\("Membre anonymisé"\)/)
  assert.doesNotMatch(memberServiceBackend, /accessLogRepository|deleteById\(id\)/)
})
