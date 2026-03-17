import React from 'react'

const themeScript = `
  (function() {
    try {
      var mode = localStorage.getItem('@iho:theme:mode') || 'system'
      var resolvedMode
      if (mode === 'system') {
        resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolvedMode = mode
      }
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolvedMode)
      var root = document.documentElement
      if (resolvedMode === 'dark') {
        root.style.setProperty('--background', '222.2 84% 4.9%')
        root.style.setProperty('--foreground', '210 40% 98%')
      } else {
        root.style.setProperty('--background', '0 0% 100%')
        root.style.setProperty('--foreground', '222.2 84% 4.9%')
      }
    } catch (e) {}
  })()
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
