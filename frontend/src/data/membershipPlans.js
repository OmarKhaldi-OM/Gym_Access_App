export const membershipPlans = [
  {
    id: 'essential',
    name: 'Essential',
    strapline: 'La force des bonnes bases.',
    monthly: 89,
    yearly: 73,
    duration: 'Sans engagement',
    features: ['Accès plateau musculation', 'Cardio & poids libres', 'Bilan forme de départ'],
    accent: 'lime',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    strapline: 'Tout le club, sans limites.',
    monthly: 139,
    yearly: 114,
    duration: 'Engagement 12 mois',
    features: ['Tout Essential', 'Cours collectifs illimités', 'Accès 7j/7 dès 6h', 'Invité 1 fois / mois'],
    accent: 'dark',
    featured: true,
  },
  {
    id: 'coaching',
    name: 'Coaching+',
    strapline: 'Un plan. Un coach. Vos résultats.',
    monthly: 229,
    yearly: 188,
    duration: 'Engagement 3 mois',
    features: ['Tout Unlimited', '2 séances coach / mois', 'Programme personnalisé', 'Suivi de progression'],
    accent: 'warm',
  },
]

export function getPlan(planId) {
  return membershipPlans.find((plan) => plan.id === planId) || membershipPlans[1]
}