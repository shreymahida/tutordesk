import { useState, Suspense, lazy } from 'react'
import { useTheme } from '../context/ThemeContext'
import { PenTool, Loader2 } from 'lucide-react'

// Excalidraw is heavy — lazy load it so it doesn't bloat the main bundle
const Excalidraw = lazy(() => import('@excalidraw/excalidraw').then(m => ({ default: m.Excalidraw })))
import '@excalidraw/excalidraw/index.css'

export default function Whiteboard() {
  const { mode } = useTheme()

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <PenTool size={26} /> Whiteboard
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">Draw, diagram, and work through problems live with your student. Screen-share this during a session.</p>
        </div>
      </div>

      <div className="card flex-1 overflow-hidden rounded-3xl">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={28} className="mx-auto mb-2 text-violet-600 animate-spin" />
              <p className="text-sm text-gray-500">Loading whiteboard...</p>
            </div>
          </div>
        }>
          <Excalidraw
            theme={mode === 'dark' ? 'dark' : 'light'}
            initialData={{ appState: { viewBackgroundColor: mode === 'dark' ? '#18181d' : '#ffffff' } }}
          />
        </Suspense>
      </div>
    </div>
  )
}
