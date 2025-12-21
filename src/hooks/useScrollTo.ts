import { useCallback } from 'react'

export function useScrollTo() {
  const scrollTo = useCallback((elementId: string, offset = 24) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }, [])

  return scrollTo
}
