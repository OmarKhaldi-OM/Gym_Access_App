import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { formatMembershipNumber, getLocalizedMembershipName } from './membershipLocalization.js'
import { staffListPath } from './pages/admin/staffNavigation.js'
import { canAccessRoute } from './roles.js'

function readSource(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

function relativeLuminance(color) {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(color.slice(start, start + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(first, second) {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

function mixColors(foreground, background, opacity) {
  return [1, 3, 5].map((start) => {
    const first = Number.parseInt(foreground.slice(start, start + 2), 16)
    const second = Number.parseInt(background.slice(start, start + 2), 16)
    return Math.round(first * opacity + second * (1 - opacity))
  })
}

function rgbHex(channels) {
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

test('member summaries recognize the canonical ACTIVE subscription status', () => {
  const source = readSource('./services/memberService.js')
  assert.match(source, /subscription\?\.statut\?\.toUpperCase\(\) === 'ACTIVE'/)
})

test('membership onboarding remains required until any subscription exists', async () => {
  const { hasMembershipHistory } = await import('./membershipAccess.js')

  assert.equal(hasMembershipHistory([]), false)
  assert.equal(hasMembershipHistory(null), false)
  assert.equal(hasMembershipHistory([{ statut: 'EXPIRED' }]), true)
})

test('protected member routes redirect accounts without subscription history to setup', () => {
  const source = readSource('./App.jsx')
  assert.match(source, /function MemberRoute\(\{ children \}\) \{\s*return <RequireRole><RequireMembership>/)
  assert.match(source, /getMemberSubscriptions\(user\.id\)/)
  assert.match(source, /if \(!result\.hasHistory\) return <Navigate to="\/membership\/setup"/)
})

test('coach client file is routed behind coach authorization and linked from the client list', () => {
  const app = readSource('./App.jsx')
  const clients = readSource('./pages/coach/MyClients.jsx')
  const detail = readSource('./pages/coach/ClientProfile.jsx')

  assert.match(app, /path="\/coach\/clients\/:id"\s+element={<RequireRole><CoachClientProfile \/><\/RequireRole>}/)
  assert.match(clients, /to={`\/coach\/clients\/\$\{c\.id\}`}/)
  assert.equal(canAccessRoute({ role: 'TRAINER' }, '/coach/clients/client-id'), true)
  assert.equal(canAccessRoute({ role: 'MEMBER' }, '/coach/clients/client-id'), false)
  assert.match(detail, /getCoachClientDetails\(user\.id, id\)/)
  assert.match(detail, /coachNoteService\.createCoachNote/)
})

test('coach client lists exclude archived members and history uses the localized deleted-member label', () => {
  const coachService = readSource('./services/coachService.js')
  const trainerBookings = readSource('./services/trainerBookingService.js')
  const schedule = readSource('./pages/coach/MySchedule.jsx')
  const requests = readSource('./pages/coach/Requests.jsx')
  const staffSessions = readSource('./pages/admin/TrainerBookings.jsx')
  const activity = readSource('./pages/admin/ActivityLog.jsx')
  const reception = readSource('./pages/reception/FrontDesk.jsx')
  const translations = readSource('./context/I18nContext.jsx')

  assert.match(trainerBookings, /\/api\/trainer-bookings\/trainer\/\$\{trainerId\}\/clients/)
  assert.match(coachService, /getClientBookingsForTrainer\(trainerId\)/)
  assert.match(coachService, /!booking\.memberArchived/)
  for (const source of [schedule, requests, staffSessions, activity, reception]) {
    assert.match(source, /deletedMember/)
  }
  for (const language of ['en', 'fr', 'ar']) {
    assert.match(translations, new RegExp(`${language}: \\{[\\s\\S]*?deletedMember: '[^']+'`))
  }
})

test('Google registration routes to membership selection without enrolling on sign-in', () => {
  const source = readSource('./pages/public/SignUp.jsx')
  const googleHandler = source.match(/const handleGoogleSignIn = async \(credential\) => \{([\s\S]*?)\n  \}/)
  assert.ok(googleHandler, 'Google sign-in handler should exist')
  assert.match(googleHandler[1], /await signInWithGoogle\(credential\)/)
  assert.match(googleHandler[1], /navigate\(`\/membership\/setup\?plan=/)
  assert.doesNotMatch(googleHandler[1], /createSubscription/)
})

test('member enrollment sends only the selected plan to the authenticated backend', () => {
  const source = readSource('./services/membershipService.js')
  const enrollment = source.match(/export function createSubscription\(plan\) \{([\s\S]*?)\n\}/)
  assert.ok(enrollment, 'self-enrollment service should exist')
  assert.match(enrollment[1], /apiPost\('\/api\/subscriptions\/enroll', \{ planId: plan\.id \}\)/)
  assert.doesNotMatch(enrollment[1], /dateDebut|dateFin|statut:\s*'ACTIVE'/)
})

test('backend membership plan and subscription names resolve from localized fields', () => {
  const plan = {
    id: 'stable-plan-id',
    nom: 'Abonnement Mensuel',
    nomEn: 'Monthly membership',
    nomAr: 'اشتراك شهري',
  }

  assert.equal(getLocalizedMembershipName(plan, 'fr'), 'Abonnement Mensuel')
  assert.equal(getLocalizedMembershipName(plan, 'en'), 'Monthly membership')
  assert.equal(getLocalizedMembershipName(plan, 'ar'), 'اشتراك شهري')
  assert.equal(getLocalizedMembershipName({
    planNom: plan.nom,
    planNomEn: plan.nomEn,
    planNomAr: plan.nomAr,
  }, 'en'), plan.nomEn)
  assert.equal(getLocalizedMembershipName({ nom: plan.nom }, 'en', 'Membership plan'), 'Membership plan')
  assert.equal(getLocalizedMembershipName({ nom: plan.nom }, 'ar', 'باقة اشتراك'), 'باقة اشتراك')
})

test('membership amounts use the selected locale without changing source values', () => {
  const amount = 1234.5

  assert.equal(formatMembershipNumber(amount, 'en'), '1,234.5')
  assert.match(formatMembershipNumber(amount, 'fr'), /,5$/)
  assert.ok(formatMembershipNumber(amount, 'ar'))
  assert.notEqual(formatMembershipNumber(amount, 'fr'), formatMembershipNumber(amount, 'en'))
  assert.equal(amount, 1234.5)
})

test('membership display labels are present in each language catalog', () => {
  const source = readSource('./context/I18nContext.jsx')
  const catalogs = source.slice(source.indexOf('const additionalMessages'), source.indexOf('const dictionaries'))
  const keys = ['membershipPlan', 'planNameEnglish', 'planNameArabic', 'planNameUnavailable', 'daysAccess', 'currencyTnd']

  for (const language of ['en', 'fr', 'ar']) {
    const start = catalogs.indexOf(`${language}: {`)
    const next = catalogs.indexOf('\n  },', start)
    const catalog = catalogs.slice(start, next)
    for (const key of keys) {
      assert.match(catalog, new RegExp(`${key}:\\s*'[^']+'`), `${language} should translate ${key}`)
    }
  }
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

test('membership onboarding and plan availability are translated in every supported language', () => {
  const source = readSource('./context/I18nContext.jsx')
  const catalogs = source.slice(source.indexOf('const additionalMessages'), source.indexOf('const dictionaries'))

  for (const language of ['en', 'fr', 'ar']) {
    const start = catalogs.indexOf(`${language}: {`)
    const next = catalogs.indexOf('\n  },', start)
    const catalog = catalogs.slice(start, next)
    for (const key of ['membershipSetupTitle', 'membershipSetupHelp', 'selectMembership', 'planAvailable']) {
      assert.match(catalog, new RegExp(`${key}:\\s*'[^']+'`), `${language} should translate ${key}`)
    }
  }
})

test('staff account management text is translated in every supported language', () => {
  const source = readSource('./context/I18nContext.jsx')
  const catalogs = source.slice(source.indexOf('const additionalMessages'), source.indexOf('const dictionaries'))
  const keys = [
    'manageStaff', 'staffManagementHelp', 'createStaff', 'editStaff', 'deleteStaff', 'staffAccounts',
    'staffRole', 'trainerRole', 'receptionistRole', 'hireDate', 'initialPassword', 'initialPasswordHelp',
    'searchStaff', 'searchStaffPlaceholder', 'filterStaffRole', 'allStaff', 'noStaffAccounts',
    'noStaffMatches', 'clearFilters', 'viewDetails', 'staffDetails', 'staffStatusUnavailable',
    'confirmDeleteStaff', 'staffCreated', 'staffUpdated', 'staffDeleted', 'staffSaveFailed', 'refresh',
    'backToStaffList', 'backToDetails', 'staffAccountId', 'requiredField', 'requiredFieldsHint',
    'staffRoleCannotChange', 'staffEmploymentDetails', 'staffStatusNotTracked', 'staffAccountNotFound',
    'staffAccountMissingHelp', 'staffAccountLoadTitle', 'staffAccountLoadFailed',
  ]

  for (const language of ['en', 'fr', 'ar']) {
    const start = catalogs.indexOf(`${language}: {`)
    const next = catalogs.indexOf('\n  },', start)
    const catalog = catalogs.slice(start, next)
    for (const key of keys) {
      assert.match(catalog, new RegExp(`${key}:\\s*'[^']+'`), `${language} should translate ${key}`)
    }
  }
})

test('staff details and editing use dedicated routes and reload data by account id', () => {
  const app = readSource('./App.jsx')
  const list = readSource('./pages/admin/Staff.jsx')
  const details = readSource('./pages/admin/StaffDetails.jsx')
  const edit = readSource('./pages/admin/StaffEdit.jsx')

  assert.equal(
    staffListPath(new URLSearchParams('search=trainer&role=TRAINER')),
    '/admin/staff?search=trainer&role=TRAINER',
  )
  assert.match(app, /path="\/admin\/staff\/new"/)
  assert.match(app, /path="\/admin\/staff\/:id\/edit"/)
  assert.match(app, /path="\/admin\/staff\/:id"/)
  assert.match(list, /staffDetailsPath\(account\.id\)/)
  assert.match(list, /staffListPath\(searchParams\)/)
  assert.doesNotMatch(list, /selectedAccount|formOpen|StaffAccountForm/)
  assert.match(details, /staffService\.getStaffAccount\(id\)/)
  assert.match(details, /backToStaffList/)
  assert.match(edit, /staffService\.getStaffAccount\(id\)/)
  assert.match(edit, /staffService\.updateStaffAccount\(payload\)/)
  assert.match(edit, /savingRef\.current/)
  assert.match(edit, /navigate\(returnTo, \{ replace: true \}\)/)
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

test('public Club navigation returns to the index top without resetting the theme session', () => {
  const appSource = readSource('./App.jsx')
  const publicSiteSource = readSource('./components/PublicSite.jsx')
  const homeSource = readSource('./pages/public/Home.jsx')

  assert.match(appSource, /<ThemeProvider>[\s\S]*<AppRoutes \/>[\s\S]*<\/ThemeProvider>/)
  assert.match(publicSiteSource, /<Link to="\/">\{t\('club'\)\}<\/Link>/)
  assert.doesNotMatch(publicSiteSource, /href="\/#club"/)
  assert.match(homeSource, /if \(hash === '#club'\) document\.getElementById\('club'\)\?\.scrollIntoView\(\)/)
  assert.match(homeSource, /<a className="text-link" href="#club">\{t\('club'\)\}/)
})

test('primary green buttons meet WCAG AA contrast in both themes and interaction states', () => {
  const source = readSource('./index.css')
  const lightTheme = source.match(/:root\s*\{([^}]*)\}/)
  const darkTheme = source.match(/:root\[data-theme='dark'\]\s*\{([^}]*)\}/)
  const primaryRule = source.match(/\.button-lime\s*\{([^}]*)\}/)
  const hoverRule = source.match(/\.button-lime:hover\s*\{([^}]*)\}/)

  assert.ok(lightTheme, 'light theme tokens should exist')
  assert.ok(darkTheme, 'dark theme tokens should exist')
  assert.ok(primaryRule, 'shared green button styles should exist')
  assert.ok(hoverRule, 'shared green hover styles should exist')
  assert.match(primaryRule[1], /color:\s*var\(--on-accent,\s*var\(--ink\)\)/)
  assert.match(source, /\.button-lime:active\s*\{[^}]*background:\s*var\(--lime\)/)
  assert.match(source, /\.button-lime:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--ink\)/)
  assert.match(source, /\.button-lime:disabled:hover\s*\{[^}]*background:\s*var\(--lime\)/)
  assert.match(source, /\.submit-button:disabled\s*\{[^}]*opacity:\s*\.65/)
  assert.match(source, /\.management-main \[class~="bg-coral"\]\s*\{[^}]*color:\s*var\(--on-accent,\s*#191c18\)/)

  const getColor = (block, token) => {
    const match = block.match(new RegExp(`${token}:\\s*(#[\\da-fA-F]{6})`))
    assert.ok(match, `expected ${token} color token`)
    return match[1]
  }
  const lightBackground = getColor(lightTheme[1], '--lime')
  const lightForeground = getColor(lightTheme[1], '--ink')
  const lightPage = getColor(lightTheme[1], '--paper')
  const darkForeground = getColor(darkTheme[1], '--on-accent')
  const darkPage = getColor(darkTheme[1], '--paper')
  const hoverBackground = getColor(hoverRule[1], 'background')

  for (const [theme, foreground] of [['light', lightForeground], ['dark', darkForeground]]) {
    assert.ok(contrastRatio(foreground, lightBackground) >= 4.5, `${theme} default/active text should meet WCAG AA`)
    assert.ok(contrastRatio(foreground, hoverBackground) >= 4.5, `${theme} hover text should meet WCAG AA`)
  }

  for (const [theme, foreground, page] of [
    ['light', lightForeground, lightPage],
    ['dark', darkForeground, darkPage],
  ]) {
    const disabledForeground = rgbHex(mixColors(foreground, page, 0.65))
    const disabledBackground = rgbHex(mixColors(lightBackground, page, 0.65))
    assert.ok(contrastRatio(disabledForeground, disabledBackground) >= 4.5, `${theme} disabled/loading text should meet WCAG AA`)
  }
})

test('notifications use readable theme tokens, responsive wrapping, and reduced motion', () => {
  const source = readSource('./index.css')
  const lightTheme = source.match(/:root\s*\{([^}]*)\}/)
  const darkTheme = source.match(/:root\[data-theme='dark'\]\s*\{([^}]*)\}/)
  assert.ok(lightTheme, 'light notification tokens should exist')
  assert.ok(darkTheme, 'dark notification tokens should exist')

  const getColor = (block, token) => {
    const match = block.match(new RegExp(`${token}:\\s*(#[\\da-fA-F]{6})`))
    assert.ok(match, `expected ${token} color token`)
    return match[1]
  }
  for (const [theme, block] of [['light', lightTheme[1]], ['dark', darkTheme[1]]]) {
    assert.ok(contrastRatio(getColor(block, '--notice-error-text'), getColor(block, '--notice-error-bg')) >= 4.5, `${theme} error text should meet WCAG AA`)
    assert.ok(contrastRatio(getColor(block, '--notice-success-text'), getColor(block, '--notice-success-bg')) >= 4.5, `${theme} success text should meet WCAG AA`)
  }

  assert.match(source, /\.gate-notification-message[\s\S]*overflow-wrap:\s*anywhere/)
  assert.match(source, /@media \(max-width:\s*600px\)[\s\S]*\.gate-notification[\s\S]*width:\s*auto/)
  assert.match(source, /prefers-reduced-motion:\s*reduce[\s\S]*\.gate-notification[\s\S]*animation:\s*none/)
  assert.match(source, /\.management-main \[role='alert'\]\.gate-toast-error\s*\{[^}]*color:\s*var\(--notice-error-text\)/)
})

test('global API feedback is a deduplicated fallback for unhandled requests', () => {
  const feedback = readSource('./components/ApiFeedback.jsx')
  const apiClient = readSource('./services/api.js')

  assert.match(feedback, /addEventListener\('unhandledrejection'/)
  assert.match(feedback, /now - lastNotificationRef\.current\.time < 5000/)
  assert.doesNotMatch(apiClient, /gate:api-error['"]\s*,\s*\{\s*detail/)
})

test('page toasts retain success announcements and expose a dismiss action', () => {
  const toast = readSource('./components/Toast.jsx')
  const toastHook = readSource('./hooks/useToast.js')

  assert.match(toast, /variant = 'success'/)
  assert.match(toast, /role=\{variant === 'error' \? 'alert' : 'status'\}/)
  assert.match(toast, /aria-label=\{t\('close', closeLabel\)\}/)
  assert.match(toastHook, /variant = 'success'/)
  assert.match(toastHook, /dismissToast/)
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

test('all frontend delete actions use the shared confirmation dialog', () => {
  const dialog = readSource('./components/ConfirmDialog.jsx')
  const classSchedule = readSource('./pages/admin/ClassSchedule.jsx')
  const plans = readSource('./pages/admin/Plans.jsx')
  const memberProfile = readSource('./pages/admin/MemberProfile.jsx')
  const profileEdit = readSource('./pages/ProfileEdit.jsx')
  const frontendSources = [
    classSchedule,
    plans,
    memberProfile,
    profileEdit,
  ]

  assert.match(dialog, /role="dialog"/)
  assert.match(dialog, /aria-modal="true"/)
  assert.match(dialog, /aria-describedby=\{itemName \?/)
  assert.match(dialog, /aria-busy=\{submitting\}/)
  assert.match(dialog, /event\.key === 'Escape'/)
  assert.match(dialog, /submittingRef\.current\) return/)
  assert.match(dialog, /event\.target === event\.currentTarget/)
  for (const source of frontendSources) assert.match(source, /<ConfirmDialog/)
  for (const source of frontendSources) assert.doesNotMatch(source, /window\.(?:confirm|alert)|\b(?:confirm|alert)\s*\(/)
})

test('confirmation dialog translations cover every supported language', () => {
  const source = readSource('./context/I18nContext.jsx')
  for (const key of ['confirmDeletion', 'delete', 'deleting', 'deletionFailed', 'confirmRemovePhoto', 'removePhoto', 'photoRemoved', 'classDeleted', 'memberDeleted']) {
    assert.equal((source.match(new RegExp(`${key}:`, 'g')) || []).length, 3, `${key} should be translated in en, fr, and ar`)
  }
})
