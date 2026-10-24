export function normalizeSearchText(value) {
  return String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function filterSearchableOptions(options, query) {
  const normalizedQuery = normalizeSearchText(query)
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean)
  if (queryWords.length === 0) return options

  const includeEmailDomain = query.includes('@')
  return options
    .map((option) => {
      const firstName = normalizeSearchText(option.firstName || option.prenom || '')
      const lastName = normalizeSearchText(option.lastName || option.nom || '')
      const label = normalizeSearchText(option.label)
      const nameText = normalizeSearchText([
      firstName,
      lastName,
      `${firstName} ${lastName}`,
      `${lastName} ${firstName}`,
      label,
      ].join(' '))
      const email = normalizeSearchText(option.description)
      const emailText = includeEmailDomain ? email : email.split('@')[0]
      const searchableText = `${nameText} ${emailText}`
      const matches = queryWords.every((word) => searchableText.includes(word))
      const matchesName = queryWords.every((word) => nameText.includes(word))
      const startsWithName = [firstName, lastName, nameText].some((name) => name.startsWith(normalizedQuery))

      return {
      option,
      rank: startsWithName ? 0 : matchesName ? 1 : 2,
      matches,
      sortLabel: label || normalizeSearchText(option.value),
      }
    })
    .filter((result) => result.matches)
    .sort((first, second) =>
      first.rank - second.rank ||
      first.sortLabel.localeCompare(second.sortLabel) ||
      String(first.option.value).localeCompare(String(second.option.value)),
    )
    .map(({ option }) => option)
}

export function getSearchableSelectDisplayValue(isOpen, isSearching, query, selectedLabel) {
  return isOpen && isSearching ? query : selectedLabel || ''
}

export function getSearchableSelectKeyAction(key, activeIndex, optionCount, isOpen) {
  if (key === 'ArrowDown') {
    return { type: 'activate', index: optionCount === 0 ? -1 : (isOpen ? (activeIndex + 1) % optionCount : 0) }
  }
  if (key === 'ArrowUp') {
    return {
      type: 'activate',
      index: optionCount === 0
        ? -1
        : isOpen && activeIndex >= 0
          ? (activeIndex - 1 + optionCount) % optionCount
          : optionCount - 1,
    }
  }
  if (key === 'Enter' && isOpen && activeIndex >= 0 && activeIndex < optionCount) {
    return { type: 'select', index: activeIndex }
  }
  if (key === 'Escape') return { type: 'restore' }
  if (key === 'Tab') return { type: 'restore', allowDefault: true }
  return null
}
