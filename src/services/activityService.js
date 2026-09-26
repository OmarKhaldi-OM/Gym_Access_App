import { activityLog as initialLog } from '../mocks/activityLog.js'

let activityLog = [...initialLog]

// Plus tard : GET /api/access-logs/periode?start=...&end=...
export async function getActivityLog() {
  return Promise.resolve([...activityLog].sort((a, b) => (a.heure < b.heure ? 1 : -1)))
}

// Plus tard : GET /api/access-logs/member/{memberId}
export async function getMemberActivity(memberId) {
  return Promise.resolve(
    activityLog
      .filter((l) => l.membreId === memberId)
      .sort((a, b) => (a.date + a.heure < b.date + b.heure ? 1 : -1)),
  )
}
