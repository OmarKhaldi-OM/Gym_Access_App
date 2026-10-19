import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PublicShell } from '../../components/PublicSite.jsx'
import { useT } from '../../context/I18nContext.jsx'

const highlights = [
  { number: '01', title: 'Train à ton rythme', detail: 'Des espaces pensés pour bouger, progresser et recommencer.' },
  { number: '02', title: 'Trouve ton collectif', detail: 'Des cours vivants, une énergie contagieuse, zéro jugement.' },
  { number: '03', title: 'Mesure le chemin', detail: 'Un suivi simple pour célébrer chaque étape franchie.' },
]

export default function Home() {
  const t = useT()
  const { hash } = useLocation()
  const localizedHighlights = highlights.map((item) => ({
    ...item,
    title: t(item.number === '01' ? 'trainAtYourPace' : item.number === '02' ? 'findYourGroup' : 'trackProgress', item.title),
    detail: t(item.number === '01' ? 'trainDetail' : item.number === '02' ? 'groupDetail' : 'progressDetail', item.detail),
  }))

  useEffect(() => {
    if (hash === '#club') document.getElementById('club')?.scrollIntoView()
  }, [hash])

  return (
    <PublicShell>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> {t('fitnessSpace')}</p>
            <h1>{t('stronger')}<br />{t('than')}<span>{t('excuses')}</span></h1>
            <p className="hero-intro">{t('heroIntro')}</p>
            <div className="hero-actions">
              <Link to="/plans" className="button button-lime">{t('plans')} <span aria-hidden="true">↗</span></Link>
              <a className="text-link" href="#club">{t('club')} <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof"><span className="proof-rule" /><p>{t('heroProof')}</p></div>
          </div>
          <div className="hero-visual" role="img" aria-label={t('heroImageAlt')}>
            <div className="hero-image" />
            <div className="hero-image-wash" />
            <div className="hero-stamp"><span>{t('stampMove')}</span><span>{t('stampYour')}</span><span>{t('stampOwn')}</span><span>{t('stampWay')}</span></div>
            <div className="hero-caption"><span>GATE / FITNESS</span><span>{t('heroCaptionTagline')}</span></div>
          </div>
          <div className="hero-side-label">{t('strength')} · {t('energy')} · {t('balance')}</div>
        </section>

        <section className="ticker" aria-label={t('clubSpaces')}>
          <div>{[t('strength'), t('cardio'), t('mobility'), t('groupTraining'), t('performance'), t('strength'), t('cardio'), t('mobility'), t('groupTraining')].map((item, index) => <span key={`${item}-${index}`}>{item}{index < 8 && <span aria-hidden="true">✳</span>}</span>)}</div>
        </section>

        <section className="intro-section" id="club">
          <div className="section-topline"><span>{t('clubName')}</span><span>{t('clubInfoPlaceholder')}</span></div>
          <div className="intro-heading"><h2>{t('movingForward')}<br /><em>{t('movingEmphasis')}</em></h2><p>{t('clubIntro')}</p></div>
          <div className="highlight-grid">{localizedHighlights.map((item) => <article className="highlight" key={item.number}><span className="highlight-number">{item.number}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div><span className="highlight-arrow" aria-hidden="true">↗</span></article>)}</div>
        </section>

        <section className="membership-callout">
          <div className="callout-photo" role="img" aria-label={t('trainingRoomAlt')} />
          <div className="callout-content"><p className="eyebrow">{t('nextChapter')}</p><h2>{t('rightPlan')}<br /><span>{t('rightTime')}</span></h2><p>{t('membershipIntro')}</p><Link to="/plans" className="button button-lime">{t('compareMemberships')} <span aria-hidden="true">↗</span></Link></div>
          <div className="callout-index">G / 26</div>
        </section>
      </main>
    </PublicShell>
  )
}