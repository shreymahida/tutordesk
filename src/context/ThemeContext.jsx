import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

// Accent palettes — each maps the violet-* scale that the whole app uses.
export const ACCENTS = {
  violet: { label: 'Violet', swatch: '#7c3aed', scale: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' } },
  blue:   { label: 'Blue',   swatch: '#2563eb', scale: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' } },
  emerald:{ label: 'Emerald',swatch: '#059669', scale: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' } },
  rose:   { label: 'Rose',   swatch: '#e11d48', scale: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' } },
  amber:  { label: 'Amber',  swatch: '#d97706', scale: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' } },
  slate:  { label: 'Graphite', swatch: '#475569', scale: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155' } },
  teal:   { label: 'Teal',   swatch: '#0d9488', scale: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' } },
  indigo: { label: 'Indigo', swatch: '#4f46e5', scale: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' } },
}

function applyTheme(mode, accentKey) {
  const root = document.documentElement
  // Accent: override the violet-* scale that all utilities reference
  const accent = ACCENTS[accentKey] || ACCENTS.violet
  Object.entries(accent.scale).forEach(([k, v]) => root.style.setProperty(`--color-violet-${k}`, v))
  // also map brand-* tokens
  Object.entries(accent.scale).forEach(([k, v]) => root.style.setProperty(`--color-brand-${k}`, v))

  // Dark mode
  root.setAttribute('data-theme', mode)
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('thq_theme') || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem('thq_accent') || 'violet')

  useEffect(() => {
    applyTheme(mode, accent)
    localStorage.setItem('thq_theme', mode)
    localStorage.setItem('thq_accent', accent)
  }, [mode, accent])

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent, toggleMode: () => setMode(m => m === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
