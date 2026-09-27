import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicShell } from '../../components/PublicSite.jsx'
import { membershipPlans } from '../../data/membershipPlans.js'
import { useT } from '../../context/I18nContext.jsx'

export default function Plans() {
  const [billing, setBilling] = useState('monthly')
  const t = useT()

  return (
    <PublicShell>
      <main className="plans-page">
        <section className="plans-heading"><p className="eyebrow"><span className="live-dot" /> {t('plans').toUpperCase()} GATE</p><h1>{t('choosePlan')}</h1><p>{t('comparePlans')}</p>
          <div className="billing-switch" role="group" aria-label={t('plans')}><button className={billing === 'monthly' ? 'selected' : ''} onClick={() => setBilling('monthly')}>{t('monthly')}</button><button className={billing === 'yearly' ? 'selected' : ''} onClick={() => setBilling('yearly')}>{t('yearly')} <span>-18%</span></button></div>
        </section>
        <section className="plan-grid" aria-label="Choisir un abonnement">
          {membershipPlans.map((plan, index) => {
            const price = plan[billing]
            return <article className={`plan-card plan-${plan.accent}${plan.featured ? ' plan-featured' : ''}`} key={plan.id}>
              {plan.featured && <div className="plan-ribbon">FORMULE COMPLÈTE</div>}
              <div className="plan-card-top"><span className="plan-index">0{index + 1} / 03</span><span className="plan-duration">{billing === 'yearly' ? '12 mois · annuel' : plan.duration}</span></div>
              <h2>{plan.name}</h2><p className="plan-strapline">{plan.strapline}</p>
              <div className="plan-price">{price}<span className="currency">DT</span><span className="price-unit">/ mois</span></div>
              <p className="billing-note">{billing === 'yearly' ? `${price * 12} DT / an` : t('billedMonthly')}</p>
              <div className="plan-divider" />
              <p className="included-label">{t('included')}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><span aria-hidden="true">↗</span>{feature}</li>)}</ul>
              <Link to={`/signup?plan=${plan.id}&billing=${billing}`} className={`button ${plan.featured ? 'button-lime' : 'button-dark'}`}>Choisir {plan.name} <span aria-hidden="true">↗</span></Link>
            </article>
          })}
        </section>
        <p className="plan-footnote">{t('demoPricing')}</p>
        <section className="plans-bottom"><span>INFORMATIONS CLUB</span><p>Coordonnées et conditions d’abonnement à renseigner par le club.</p><span className="plans-currency">TND / DT</span></section>
      </main>
    </PublicShell>
  )
}