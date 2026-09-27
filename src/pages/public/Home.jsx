import { Link } from 'react-router-dom'
import { PublicShell } from '../../components/PublicSite.jsx'
import { useT } from '../../context/I18nContext.jsx'

const highlights = [
  { number: '01', title: 'Train à ton rythme', detail: 'Des espaces pensés pour bouger, progresser et recommencer.' },
  { number: '02', title: 'Trouve ton collectif', detail: 'Des cours vivants, une énergie contagieuse, zéro jugement.' },
  { number: '03', title: 'Mesure le chemin', detail: 'Un suivi simple pour célébrer chaque étape franchie.' },
]

export default function Home() {
  const t = useT()
  const localizedHighlights = highlights.map((item) => ({
    ...item,
    title: t(item.number === '01' ? 'trainAtYourPace' : item.number === '02' ? 'findYourGroup' : 'trackProgress', item.title),
    detail: t(item.number === '01' ? 'trainDetail' : item.number === '02' ? 'groupDetail' : 'progressDetail', item.detail),
  }))
  return (
    <PublicShell>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> {t('fitnessSpace', 'ESPACE FITNESS · TON RYTHME')}</p>
            <h1>{t('stronger', 'Plus fort')}<br />{t('than', 'que ')}<span>{t('excuses', 'tes excuses.')}</span></h1>
            <p className="hero-intro">{t('heroIntro', 'Un club qui te ressemble. Du premier mouvement au prochain record, on est là pour la suite.')}</p>
            <div className="hero-actions">
              <Link to="/plans" className="button button-lime">{t('plans')} <span aria-hidden="true">↗</span></Link>
              <a className="text-link" href="#club">{t('club')} <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof"><span className="proof-rule" /><p>FORCE <span>·</span> CARDIO <span>·</span> COACHING</p></div>
          </div>
          <div className="hero-visual" role="img" aria-label="Athlète s'entraînant dans un club de fitness">
            <div className="hero-image" />
            <div className="hero-image-wash" />
            <div className="hero-stamp"><span>MOVE</span><span>YOUR</span><span>OWN</span><span>WAY</span></div>
            <div className="hero-caption"><span>GATE / FITNESS</span><span>LA SALLE, À TA MANIÈRE.</span></div>
          </div>
          <div className="hero-side-label">FORCE · ÉNERGIE · ÉQUILIBRE</div>
        </section>

        <section className="ticker" aria-label="Nos espaces">
          <div>FORCE <span>✳</span> CARDIO <span>✳</span> MOBILITÉ <span>✳</span> COLLECTIF <span>✳</span> PERFORMANCE <span>✳</span> FORCE <span>✳</span> CARDIO <span>✳</span> MOBILITÉ <span>✳</span> COLLECTIF <span>✳</span></div>
        </section>

        <section className="intro-section" id="club">
          <div className="section-topline"><span>LE CLUB GATE</span><span>INFORMATIONS CLUB · À COMPLÉTER</span></div>
          <div className="intro-heading"><h2>La meilleure<br />version, <em>en mouvement.</em></h2><p>Pas besoin d’être prêt pour commencer. Il suffit de pousser la porte. Le reste, on le construit ensemble.</p></div>
          <div className="highlight-grid">{localizedHighlights.map((item) => <article className="highlight" key={item.number}><span className="highlight-number">{item.number}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className="highlight-arrow" aria-hidden="true">↗</span></article>)}</div>
        </section>

        <section className="membership-callout">
          <div className="callout-photo" role="img" aria-label="Espace d'entraînement Gate" />
          <div className="callout-content"><p className="eyebrow">TON PROCHAIN CHAPITRE</p><h2>Le bon plan.<br /><span>Le bon moment.</span></h2><p>Des abonnements clairs, des bénéfices concrets, et la liberté de choisir ta façon de progresser.</p><Link to="/plans" className="button button-lime">Comparer les abonnements <span aria-hidden="true">↗</span></Link></div>
          <div className="callout-index">G / 26</div>
        </section>
      </main>
    </PublicShell>
  )
}