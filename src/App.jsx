import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ApiFeedback from './components/ApiFeedback.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { MembersProvider } from './context/MembersContext.jsx'
import { ClassesProvider } from './context/ClassesContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { I18nProvider } from './context/I18nContext.jsx'
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

import MyStatus from './pages/member/MyStatus.jsx'
import MyClasses from './pages/member/MyClasses.jsx'
import MyTrainerSessions from './pages/member/MyTrainerSessions.jsx'
import MyProfile from './pages/member/MyProfile.jsx'

import CoachSchedule from './pages/coach/MySchedule.jsx'
import CoachClients from './pages/coach/MyClients.jsx'
import CoachProfile from './pages/coach/MyProfile.jsx'

import FrontDesk from './pages/reception/FrontDesk.jsx'
import ReceptionSchedule from './pages/reception/Schedule.jsx'
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
  const { user, ready } = useAuth()
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
      <Route path="/admin/dashboard" element={<RequireRole role="admin" user={user} ready={ready}><AdminDashboard /></RequireRole>} />
      <Route path="/admin/activity" element={<RequireRole role="admin" user={user} ready={ready}><AdminActivityLog /></RequireRole>} />
      <Route path="/admin/members" element={<RequireRole role="admin" user={user} ready={ready}><AdminMembers /></RequireRole>} />
      <Route path="/admin/members/:id" element={<RequireRole role="admin" user={user} ready={ready}><AdminMemberProfile /></RequireRole>} />
      <Route path="/admin/schedule" element={<RequireRole role="admin" user={user} ready={ready}><AdminClassSchedule /></RequireRole>} />
      <Route path="/admin/trainer-bookings" element={<RequireRole role="admin" user={user} ready={ready}><AdminTrainerBookings /></RequireRole>} />
      <Route path="/admin/profile" element={<RequireRole role="admin" user={user} ready={ready}><ProfileEdit role="admin" /></RequireRole>} />

      {/* Membre (personal) view */}
      <Route path="/membre" element={<Navigate to="/membre/dashboard" replace />} />
      <Route path="/membre/dashboard" element={<RequireRole role="membre" user={user} ready={ready}><MyStatus /></RequireRole>} />
      <Route path="/membre/bookings" element={<RequireRole role="membre" user={user} ready={ready}><MyClasses /></RequireRole>} />
      <Route path="/membre/trainer-sessions" element={<RequireRole role="membre" user={user} ready={ready}><MyTrainerSessions /></RequireRole>} />
      <Route path="/membre/profile" element={<RequireRole role="membre" user={user} ready={ready}><ProfileEdit role="membre" /></RequireRole>} />
      <Route path="/membre/coaching" element={<RequireRole role="membre" user={user} ready={ready}><CoachingRequests /></RequireRole>} />
      <Route path="/membre/progress" element={<RequireRole role="membre" user={user} ready={ready}><MemberProgress /></RequireRole>} />

      {/* Coach (trainer) view */}
      <Route path="/coach" element={<Navigate to="/coach/planning" replace />} />
      <Route path="/coach/planning" element={<RequireRole role="coach" user={user} ready={ready}><CoachSchedule /></RequireRole>} />
      <Route path="/coach/clients" element={<RequireRole role="coach" user={user} ready={ready}><CoachClients /></RequireRole>} />
      <Route path="/coach/profil" element={<RequireRole role="coach" user={user} ready={ready}><ProfileEdit role="coach" /></RequireRole>} />
      <Route path="/coach/requests" element={<RequireRole role="coach" user={user} ready={ready}><CoachRequests /></RequireRole>} />

      {/* Réceptionniste (front desk) view */}
      <Route path="/reception" element={<Navigate to="/reception/accueil" replace />} />
      <Route path="/reception/accueil" element={<RequireRole role="reception" user={user} ready={ready}><FrontDesk /></RequireRole>} />
      <Route path="/reception/planning" element={<RequireRole role="reception" user={user} ready={ready}><ReceptionSchedule /></RequireRole>} />
      <Route path="/reception/profil" element={<RequireRole role="reception" user={user} ready={ready}><ProfileEdit role="reception" /></RequireRole>} />
    </Routes>
    </>
  )
}

function RequireRole({ role, user, ready, children }) {
  const location = useLocation()
  if (!ready) return <main className="min-h-screen grid place-items-center">Chargement…</main>
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  if (user.role !== role) {
    const destinations = { admin: '/admin/dashboard', membre: '/membre/dashboard', coach: '/coach/planning', reception: '/reception/accueil' }
    return <Navigate to={destinations[user.role] || '/'} replace />
  }
  return children
}
