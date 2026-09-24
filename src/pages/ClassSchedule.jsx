import Layout from '../components/Layout.jsx'
import { Panel } from '../components/Panel.jsx'

const days = [
  {
    day: 'Lundi',
    classes: [
      { name: 'Yoga Matinal', coach: 'Nour Kefi', time: '07:00', studio: 'Studio A', spots: 4 },
      { name: 'CrossTraining', coach: 'Wassim Jendoubi', time: '18:30', studio: 'Studio B', spots: 0 },
    ],
  },
  {
    day: 'Mardi',
    classes: [
      { name: 'Spinning', coach: 'Karim Bouazizi', time: '12:00', studio: 'Studio C', spots: 6 },
    ],
  },
  {
    day: 'Mercredi',
    classes: [
      { name: 'Yoga Matinal', coach: 'Nour Kefi', time: '07:00', studio: 'Studio A', spots: 2 },
      { name: 'Boxe', coach: 'Wassim Jendoubi', time: '19:00', studio: 'Studio B', spots: 3 },
    ],
  },
]

export default function ClassSchedule() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Planning des cours</h1>

      <div className="grid grid-cols-3 gap-4">
        {days.map((d) => (
          <div key={d.day}>
            <h2 className="text-sm font-semibold mb-3">{d.day}</h2>
            <div className="space-y-3">
              {d.classes.map((c) => (
                <Panel key={c.name + c.time} className="p-4">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-text-muted mt-1">{c.coach}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-graphite-line">
                    <span className="text-xs font-mono text-text-muted">{c.time} · {c.studio}</span>
                    <span className={`text-xs font-mono ${c.spots === 0 ? 'text-coral' : 'text-teal'}`}>
                      {c.spots === 0 ? 'Complet' : `${c.spots} places`}
                    </span>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
