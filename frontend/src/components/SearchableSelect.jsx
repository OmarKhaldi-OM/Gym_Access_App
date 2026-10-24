import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  filterSearchableOptions,
  getSearchableSelectDisplayValue,
  getSearchableSelectKeyAction,
} from './searchableSelectUtils.js'

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  emptyText,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [position, setPosition] = useState(null)
  const id = useId()
  const listboxId = `${id}-listbox`
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = useMemo(
    () => filterSearchableOptions(options, isSearching ? query : ''),
    [options, query, isSearching],
  )
  const displayedValue = getSearchableSelectDisplayValue(
    isOpen,
    isSearching,
    query,
    selectedOption?.label,
  )

  function closeAndRestore() {
    setIsOpen(false)
    setIsSearching(false)
    setQuery('')
    setActiveIndex(-1)
  }

  function selectOption(option) {
    onChange(option.value)
    closeAndRestore()
  }

  function updatePosition() {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, Math.min(240, window.innerHeight - rect.bottom - 8)),
    })
  }

  useEffect(() => {
    if (!isOpen) return undefined

    updatePosition()
    const onPointerDown = (event) => {
      if (rootRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return
      closeAndRestore()
    }
    const onLayoutChange = () => updatePosition()
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onLayoutChange)
    window.addEventListener('scroll', onLayoutChange, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onLayoutChange)
      window.removeEventListener('scroll', onLayoutChange, true)
    }
  }, [isOpen])

  function openList() {
    if (disabled) return
    setIsSearching(false)
    setQuery('')
    setActiveIndex(-1)
    setIsOpen(true)
  }

  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, listboxId])

  useEffect(() => {
    if (!isOpen && document.activeElement === inputRef.current) inputRef.current.select()
  }, [isOpen, value])

  function handleKeyDown(event) {
    const action = getSearchableSelectKeyAction(
      event.key,
      activeIndex,
      filteredOptions.length,
      isOpen,
    )
    if (!action) return

    if (action.type === 'activate') {
      event.preventDefault()
      if (filteredOptions.length === 0) return
      if (!isOpen) openList()
      setActiveIndex(action.index)
      return
    }
    if (action.type === 'select') {
      event.preventDefault()
      selectOption(filteredOptions[action.index])
      return
    }
    if (!action.allowDefault) event.preventDefault()
    closeAndRestore()
  }

  return (
    <div className="searchable-select" ref={rootRef}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        value={displayedValue}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={(event) => {
          openList()
          event.currentTarget.select()
        }}
        onClick={(event) => {
          if (!isOpen) openList()
          if (!isSearching) event.currentTarget.select()
        }}
        onChange={(event) => {
          const nextQuery = event.target.value
          const matchingOptions = filterSearchableOptions(options, nextQuery)
          setQuery(nextQuery)
          setIsSearching(true)
          setIsOpen(true)
          setActiveIndex(matchingOptions.length ? 0 : -1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (!listRef.current?.contains(event.relatedTarget)) closeAndRestore()
        }}
        className="searchable-select__input"
      />
      <svg className="searchable-select__chevron" viewBox="0 0 20 20" aria-hidden="true">
        <path d="m5 7.5 5 5 5-5" />
      </svg>
      {isOpen && position && createPortal(
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="searchable-select__listbox"
          style={position}
        >
          {filteredOptions.length === 0 ? (
            <div className="searchable-select__empty" role="presentation">{emptyText}</div>
          ) : filteredOptions.map((option, index) => (
            <div
              id={`${listboxId}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`searchable-select__option${index === activeIndex ? ' is-active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              <span className="searchable-select__option-copy">
                <span className="searchable-select__option-label">{option.label}</span>
                {option.description && (
                  <span className="searchable-select__option-description">{option.description}</span>
                )}
              </span>
              {option.badge && <span className="searchable-select__badge">{option.badge}</span>}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
