const TECHNICAL_OR_SENSITIVE_MESSAGE = /(?:exception|stack\s*trace|\bat\s+[\w.$]+\(|<\/?(?:html|body|pre)\b|\b(?:sql|jdbc|hibernate|token|password|secret|authorization|bearer|jwt)\b|org\.springframework|java\.)/i

function getSafeServerMessage(body) {
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > 240 || TECHNICAL_OR_SENSITIVE_MESSAGE.test(message)) return ''
  return message
}

function getValidationMessage(body, serverMessage) {
  if (!serverMessage) return 'Certaines informations sont manquantes ou invalides. Vérifiez les champs et réessayez.'
  const field = typeof body?.field === 'string' && /^[\w.-]{1,60}$/.test(body.field) ? body.field : ''
  return field && !serverMessage.toLocaleLowerCase().includes(field.toLocaleLowerCase())
    ? `Champ « ${field} » : ${serverMessage}`
    : serverMessage
}

export function getApiErrorInfo(status, path, body, { network = false } = {}) {
  if (network) {
    return {
      category: 'network',
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.',
    }
  }

  const serverMessage = status < 500 ? getSafeServerMessage(body) : ''
  if (status === 401) {
    return {
      category: 'authentication',
      message: path === '/api/auth/login'
        ? 'Adresse e-mail ou mot de passe incorrect.'
        : path === '/api/auth/face-login'
          ? 'Visage non reconnu ou non enrôlé. Réessayez ou utilisez votre mot de passe.'
          : 'Votre session a expiré. Connectez-vous à nouveau.',
    }
  }
  if (status === 403) {
    return { category: 'authorization', message: 'Vous n’avez pas les droits pour effectuer cette action.' }
  }
  if (status === 400 || status === 422) {
    return {
      category: 'validation',
      message: getValidationMessage(body, serverMessage),
    }
  }
  if (status === 404) {
    return { category: 'notFound', message: serverMessage || 'L’élément demandé est introuvable.' }
  }
  if (status === 409) {
    return { category: 'conflict', message: serverMessage || 'Cette action entre en conflit avec les données actuelles.' }
  }
  if (status === 429) {
    return { category: 'rateLimit', message: 'Trop de demandes ont été envoyées. Patientez un instant puis réessayez.' }
  }
  if (status >= 500) {
    return {
      category: 'server',
      message: status === 503
        && (path.startsWith('/api/face-recognition/') || path === '/api/auth/face-login')
        ? 'La reconnaissance faciale est temporairement indisponible. Réessayez plus tard.'
        : 'Une erreur est survenue sur le serveur. Réessayez dans quelques instants.',
    }
  }
  return { category: 'request', message: serverMessage || 'La demande n’a pas pu aboutir. Réessayez.' }
}