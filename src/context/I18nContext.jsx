import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const I18nContext = createContext(null)
const STORAGE_KEY = 'gate.language'

const messages = {
  en: {
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    home: 'Home',
    plans: 'Memberships',
    club: 'The club',
    signIn: 'Sign in',
    join: 'Join the club',
    memberSpace: 'Member area',
    logout: 'Sign out',
    demo: 'DEMO',
    admin: 'Admin',
    member: 'Member',
    coach: 'Coach',
    reception: 'Front desk',
    dashboard: 'Dashboard',
    activity: 'Activity log',
    members: 'Members',
    schedule: 'Schedule',
    trainerBookings: 'Coach bookings',
    status: 'My status',
    bookings: 'My classes',
    trainerSessions: 'My coach sessions',
    profile: 'Profile',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    currentWeek: 'Current week',
    close: 'Close',
    today: 'Today',
    allStatuses: 'All statuses',
    entries: 'Entries',
    exits: 'Exits',
    refused: 'Refused',
    noEvents: 'No events for this filter.',
    noMembers: 'No members match this search.',
    noPassages: 'No visits recorded.',
    noSessions: 'No session scheduled.',
    noSlots: 'No slot this week.',
    searchMember: 'Search for a member...',
    enrolled: 'Face enrolled',
    notEnrolled: 'Not enrolled',
    active: 'Active',
    suspended: 'Suspended',
    entry: 'Entry',
    exit: 'Exit',
    refusedStatus: 'Refused',
    choosePlan: 'Choose a membership',
    comparePlans: 'Compare demo options and choose the one that fits you.',
    monthly: 'Monthly',
    yearly: 'Annual',
    billedMonthly: 'Billed monthly · TND',
    billedYearly: 'Billed yearly · TND',
    included: 'WHAT IS INCLUDED',
    demoPricing: 'Demonstration prices and benefits, non-contractual. Prices in Tunisian dinars (TND); no real payment is processed.',
    createAccount: 'Create account & activate',
    connection: 'Sign in',
    email: 'Email address',
    password: 'Password',
    fullName: 'Full name',
    namePlaceholder: 'e.g. Alex Martin',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'At least 8 characters',
    wrongCredentials: 'Incorrect email or password.',
    signupError: 'Account creation failed.',
    loading: 'Loading...',
    noPayment: 'Demo journey: no real payment will be requested or charged.',
  },
  fr: {
    language: 'Langue', theme: 'Thème', light: 'Clair', dark: 'Sombre', home: 'Accueil', plans: 'Abonnements', club: 'Le club', signIn: 'Se connecter', join: 'Rejoindre le club', memberSpace: 'Espace membre', logout: 'Se déconnecter', demo: 'DÉMO', admin: 'Admin', member: 'Membre', coach: 'Coach', reception: 'Réception', dashboard: 'Tableau de bord', activity: "Journal d'activité", members: 'Membres', schedule: 'Planning', trainerBookings: 'Réservations coach', status: 'Mon statut', bookings: 'Mes cours', trainerSessions: 'Mes séances coach', profile: 'Profil', previousWeek: 'Semaine précédente', nextWeek: 'Semaine suivante', currentWeek: 'Semaine actuelle', close: 'Fermer', today: "Aujourd'hui", allStatuses: 'Tous les statuts', entries: 'Entrées', exits: 'Sorties', refused: 'Refusés', noEvents: 'Aucun événement pour ce filtre.', noMembers: 'Aucun membre ne correspond à cette recherche.', noPassages: 'Aucun passage enregistré.', noSessions: 'Aucune séance programmée.', noSlots: 'Aucun créneau cette semaine.', searchMember: 'Rechercher un membre...', enrolled: 'Visage enrôlé', notEnrolled: 'Non enrôlé', active: 'Actif', suspended: 'Suspendu', entry: 'Entrée', exit: 'Sortie', refusedStatus: 'Refusé', choosePlan: 'Choisis ton terrain.', comparePlans: 'Compare les options de démonstration et choisis celle qui te convient.', monthly: 'Mensuel', yearly: 'Annuel', billedMonthly: 'Facturé chaque mois · TND', billedYearly: 'Facturé chaque année · TND', included: 'CE QUI EST INCLUS', demoPricing: 'Tarifs et avantages de démonstration, non contractuels. Prix en dinars tunisiens (TND) · aucun paiement réel n’est effectué.', createAccount: 'Créer mon compte & activer', connection: 'Connexion', email: 'Adresse e-mail', password: 'Mot de passe', fullName: 'Nom complet', namePlaceholder: 'Ex. Alex Martin', emailPlaceholder: 'toi@exemple.com', passwordPlaceholder: '8 caractères minimum', wrongCredentials: 'Adresse e-mail ou mot de passe incorrecte.', signupError: 'La création du compte a échoué.', loading: 'Chargement…', noPayment: 'Parcours de démonstration : aucun paiement réel ne sera demandé ou prélevé.',
  },
  ar: {
    language: 'اللغة', theme: 'المظهر', light: 'فاتح', dark: 'داكن', home: 'الرئيسية', plans: 'الاشتراكات', club: 'النادي', signIn: 'تسجيل الدخول', join: 'انضم إلى النادي', memberSpace: 'مساحة الأعضاء', logout: 'تسجيل الخروج', demo: 'تجريبي', admin: 'الإدارة', member: 'عضو', coach: 'مدرب', reception: 'الاستقبال', dashboard: 'لوحة التحكم', activity: 'سجل النشاط', members: 'الأعضاء', schedule: 'الجدول', trainerBookings: 'حجوزات المدربين', status: 'حالتي', bookings: 'حصصي', trainerSessions: 'جلساتي مع المدرب', profile: 'الملف الشخصي', previousWeek: 'الأسبوع السابق', nextWeek: 'الأسبوع القادم', currentWeek: 'الأسبوع الحالي', close: 'إغلاق', today: 'اليوم', allStatuses: 'كل الحالات', entries: 'الدخول', exits: 'الخروج', refused: 'مرفوض', noEvents: 'لا توجد أحداث لهذا الفلتر.', noMembers: 'لا يوجد أعضاء يطابقون البحث.', noPassages: 'لا توجد زيارات مسجلة.', noSessions: 'لا توجد جلسات مجدولة.', noSlots: 'لا توجد مواعيد هذا الأسبوع.', searchMember: 'ابحث عن عضو...', enrolled: 'تم تسجيل الوجه', notEnrolled: 'لم يتم التسجيل', active: 'نشط', suspended: 'موقوف', entry: 'دخول', exit: 'خروج', refusedStatus: 'مرفوض', choosePlan: 'اختر اشتراكك', comparePlans: 'قارن الخيارات التجريبية واختر ما يناسبك.', monthly: 'شهري', yearly: 'سنوي', billedMonthly: 'تدفع شهريا · بالدينار', billedYearly: 'تدفع سنويا · بالدينار', included: 'ما يتضمنه الاشتراك', demoPricing: 'أسعار ومزايا تجريبية وغير تعاقدية. الأسعار بالدينار التونسي ولا تتم أي عملية دفع حقيقية.', createAccount: 'إنشاء الحساب وتفعيل الاشتراك', connection: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور', fullName: 'الاسم الكامل', namePlaceholder: 'مثال: أحمد محمد', emailPlaceholder: 'you@example.com', passwordPlaceholder: '8 أحرف على الأقل', wrongCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', signupError: 'تعذر إنشاء الحساب.', loading: 'جار التحميل...', noPayment: 'مسار تجريبي: لن يتم طلب أو خصم أي مبلغ حقيقي.',
  },
}

const contentMessages = {
  en: { createClass: 'Create class', fitnessSpace: 'FITNESS SPACE · YOUR PACE', stronger: 'Stronger', than: 'than ', excuses: 'your excuses.', heroIntro: 'A club that fits you. From the first movement to your next personal best, we are here for what comes next.', trainAtYourPace: 'Train at your pace', trainDetail: 'Spaces designed to move, progress, and start again.', findYourGroup: 'Find your people', groupDetail: 'Energizing classes, a welcoming atmosphere, no judgment.', trackProgress: 'Track the journey', progressDetail: 'Simple progress tracking to celebrate every step.' },
  fr: { createClass: 'Ajouter un cours', fitnessSpace: 'ESPACE FITNESS · TON RYTHME', stronger: 'Plus fort', than: 'que ', excuses: 'tes excuses.', heroIntro: 'Un club qui te ressemble. Du premier mouvement au prochain record, on est là pour la suite.', trainAtYourPace: 'Train à ton rythme', trainDetail: 'Des espaces pensés pour bouger, progresser et recommencer.', findYourGroup: 'Trouve ton collectif', groupDetail: 'Des cours vivants, une énergie contagieuse, zéro jugement.', trackProgress: 'Mesure le chemin', progressDetail: 'Un suivi simple pour célébrer chaque étape franchie.' },
  ar: { createClass: 'إضافة حصة', fitnessSpace: 'مساحة اللياقة · إيقاعك الخاص', stronger: 'أقوى', than: 'من ', excuses: 'أعذارك.', heroIntro: 'نادي يشبهك. من أول حركة إلى إنجازك القادم، نحن هنا للخطوة التالية.', trainAtYourPace: 'تمرّن بإيقاعك', trainDetail: 'مساحات مصممة للحركة والتقدم والبدء من جديد.', findYourGroup: 'اعثر على مجموعتك', groupDetail: 'حصص مليئة بالطاقة وأجواء ترحيبية بلا أحكام.', trackProgress: 'تابع تقدمك', progressDetail: 'متابعة بسيطة للاحتفال بكل خطوة.' },
}

function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return messages[saved] ? saved : 'fr'
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)
  const direction = language === 'ar' ? 'rtl' : 'ltr'
  const value = useMemo(() => ({ language, direction, messages: { ...messages[language], ...contentMessages[language] }, setLanguage }), [language, direction])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
    document.documentElement.dataset.language = language
    localStorage.setItem(STORAGE_KEY, language)
  }, [language, direction])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n doit être utilisé dans un I18nProvider')
  return context
}

export function useT() {
  const { messages } = useI18n()
  return (key, fallback = key) => messages[key] || fallback
}
