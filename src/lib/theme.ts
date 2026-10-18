import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sub2api-plaza:theme'

function current(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((previous) => {
      const next: Theme = previous === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* private mode: the in-memory choice still holds for this visit */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
