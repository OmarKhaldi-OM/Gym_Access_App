import Layout from '../../components/Layout.jsx'
import { Panel, SectionHeader } from '../../components/Panel.jsx'
import StatusChip from '../../components/StatusChip.jsx'
import Avatar from '../../components/Avatar.jsx'
import { useI18n, useT } from '../../context/I18nContext.jsx'

export default function MyProfile() {
  const t = useT()
  const { language } = useI18n()
  return (
    <Layout role="coach">
      <h1 className="text-2xl font-bold mb-6">{t('myProfile')}</h1>

      <Panel className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name="Rania Sfar" size="lg" />
          <div className="flex-1">
            <p className="text-xl font-bold">Rania Sfar</p>
            <p className="text-base font-medium text-text-muted mt-0.5">rania.sfar@gym.com</p>
          </div>
          <StatusChip variant="positive">Active</StatusChip>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-graphite-line">
          <div>
            <p className="text-base font-medium text-text-muted">{t('specialty')}</p>
            <p className="text-lg font-semibold mt-1">{t('specialtyPilatesStrength')}</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">{t('coachSince')}</p>
            <p className="text-lg font-mono mt-1">{new Date(2023, 2, 1).toLocaleDateString(language, { month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-base font-medium text-text-muted">{t('mainStudio')}</p>
            <p className="text-lg font-semibold mt-1">Studio A</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title={t('thisWeek')} />
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-base font-medium text-text-muted">{t('scheduledSessions')}</p>
          <p className="text-lg font-semibold">5</p>
        </div>
      </Panel>
    </Layout>
  )
}
