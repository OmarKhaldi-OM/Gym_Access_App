import MemberProfile from '../members/MemberProfile.jsx'

export default function AdminMemberProfile() {
  return <MemberProfile role="admin" memberListPath="/admin/members" canManage />
}
