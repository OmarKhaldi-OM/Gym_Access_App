import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'

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

export default function App() {
  return (
    <Routes>
      {/* Entry point */}
      <Route path="/" element={<Login />} />

      {/* Admin (staff/management) view */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/activity" element={<AdminActivityLog />} />
      <Route path="/admin/members" element={<AdminMembers />} />
      <Route path="/admin/members/:id" element={<AdminMemberProfile />} />
      <Route path="/admin/schedule" element={<AdminClassSchedule />} />
      <Route path="/admin/trainer-bookings" element={<AdminTrainerBookings />} />

      {/* Membre (personal) view */}
      <Route path="/membre" element={<Navigate to="/membre/dashboard" replace />} />
      <Route path="/membre/dashboard" element={<MyStatus />} />
      <Route path="/membre/bookings" element={<MyClasses />} />
      <Route path="/membre/trainer-sessions" element={<MyTrainerSessions />} />
      <Route path="/membre/profile" element={<MyProfile />} />

      {/* Coach (trainer) view */}
      <Route path="/coach" element={<Navigate to="/coach/planning" replace />} />
      <Route path="/coach/planning" element={<CoachSchedule />} />
      <Route path="/coach/clients" element={<CoachClients />} />
      <Route path="/coach/profil" element={<CoachProfile />} />

      {/* Réceptionniste (front desk) view */}
      <Route path="/reception" element={<Navigate to="/reception/accueil" replace />} />
      <Route path="/reception/accueil" element={<FrontDesk />} />
      <Route path="/reception/planning" element={<ReceptionSchedule />} />
    </Routes>
  )
}
