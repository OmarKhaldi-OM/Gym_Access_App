import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ApiFeedback from './components/ApiFeedback.jsx'
import { ApiLoading } from './components/ApiState.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { canAccessRoute, getHomePath } from './roles.js'
import { MembersProvider } from './context/MembersContext.jsx'
import { ClassesProvider } from './context/ClassesContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { I18nProvider } from './context/I18nContext.jsx'
import { useT } from './context/I18nContext.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/public/Home.jsx'
import Plans from './pages/public/Plans.jsx'
import SignUp from './pages/public/SignUp.jsx'

import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminActivityLog from './pages/admin/ActivityLog.jsx'
import AdminMembers from './pages/admin/Members.jsx'
import AdminMemberProfile from './pages/admin/MemberProfile.jsx'
import AdminClassSchedule from './pages/admin/ClassSchedule.jsx'
import AdminTrainerBookings from './pages/admin/TrainerBookings.jsx'
import AdminPlans from './pages/admin/Plans.jsx'

import MyStatus from './pages/member/MyStatus.jsx'
import MyMembership from './pages/member/MyMembership.jsx'
import MyClasses from './pages/member/MyClasses.jsx'
import MyTrainerSessions from './pages/member/MyTrainerSessions.jsx'

import CoachSchedule from './pages/coach/MySchedule.jsx'
import CoachClients from './pages/coach/MyClients.jsx'

import FrontDesk from './pages/reception/FrontDesk.jsx'
import ReceptionSchedule from './pages/reception/Schedule.jsx'
import FaceRecognitionPage from './pages/FaceRecognitionPage.jsx'
import CoachingRequests from './pages/member/CoachingRequests.jsx'
import MemberProgress from './pages/member/Progress.jsx'
import CoachRequests from './pages/coach/Requests.jsx'
import ProfileEdit from './pages/ProfileEdit.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <MembersProvider>
            <ClassesProvider>
              <AppRoutes />
            </ClassesProvider>
          </MembersProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

function AppRoutes() {
  return (
    <>
    <ApiFeedback />
    <Routes>
      {/* Public membership journey */}
      <Route path="/" element={<Home />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Admin (staff/management) view */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<RequireRole><AdminDashboard /></RequireRole>} />
      <Route path="/admin/activity" element={<RequireRole><AdminActivityLog /></RequireRole>} />
      <Route path="/admin/members" element={<RequireRole><AdminMembers /></RequireRole>} />
      <Route path="/admin/members/:id" element={<RequireRole><AdminMemberProfile /></RequireRole>} />
      <Route path="/admin/schedule" element={<RequireRole><AdminClassSchedule /></RequireRole>} />
      <Route path="/admin/trainer-bookings" element={<RequireRole><AdminTrainerBookings /></RequireRole>} />
      <Route path="/admin/plans" element={<RequireRole><AdminPlans /></RequireRole>} />
      <Route path="/admin/face-recognition" element={<RequireRole><FaceRecognitionPage /></RequireRole>} />
      <Route path="/admin/profile" element={<RequireRole><ProfileEdit /></RequireRole>} />

      {/* Membre (personal) view */}
      <Route path="/membre" element={<Navigate to="/membre/dashboard" replace />} />
      <Route path="/membre/dashboard" element={<RequireRole><MyStatus /></RequireRole>} />
      <Route path="/membre/membership" element={<RequireRole><MyMembership /></RequireRole>} />
      <Route path="/membre/bookings" element={<RequireRole><MyClasses /></RequireRole>} />
      <Route path="/membre/trainer-sessions" element={<RequireRole><MyTrainerSessions /></RequireRole>} />
      <Route path="/membre/face-recognition" element={<RequireRole><FaceRecognitionPage /></RequireRole>} />
      <Route path="/membre/profile" element={<RequireRole><ProfileEdit /></RequireRole>} />
      <Route path="/membre/coaching" element={<RequireRole><CoachingRequests /></RequireRole>} />
      <Route path="/membre/progress" element={<RequireRole><MemberProgress /></RequireRole>} />

      {/* Coach (trainer) view */}
      <Route path="/coach" element={<Navigate to="/coach/planning" replace />} />
      <Route path="/coach/planning" element={<RequireRole><CoachSchedule /></RequireRole>} />
      <Route path="/coach/clients" element={<RequireRole><CoachClients /></RequireRole>} />
      <Route path="/coach/profil" element={<RequireRole><ProfileEdit /></RequireRole>} />
      <Route path="/coach/requests" element={<RequireRole><CoachRequests /></RequireRole>} />

      {/* Réceptionniste (front desk) view */}
      <Route path="/reception" element={<Navigate to="/reception/accueil" replace />} />
      <Route path="/reception/accueil" element={<RequireRole><FrontDesk /></RequireRole>} />
      <Route path="/reception/planning" element={<RequireRole><ReceptionSchedule /></RequireRole>} />
      <Route path="/reception/face-recognition" element={<RequireRole><FaceRecognitionPage /></RequireRole>} />
      <Route path="/reception/profil" element={<RequireRole><ProfileEdit /></RequireRole>} />
    </Routes>
    </>
  )
}

function RequireRole({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  const t = useT()
  if (!ready) return <main className="min-h-screen grid place-items-center"><ApiLoading message={t('loading')} /></main>
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  if (!canAccessRoute(user, location.pathname)) return <Navigate to={getHomePath(user) || '/'} replace />
  return children
}
