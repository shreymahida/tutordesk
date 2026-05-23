import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import '@excalidraw/excalidraw/index.css'
import { supabase } from '../lib/supabase'
import { Check, Loader2 } from 'lucide-react'

// Lazy-load Excalidraw so it doesn't bloat the main app bundle.
const Excalidraw = lazy(() => import('@excalidraw/excalidraw').then(m => ({ default: m.Excalidraw })))

// A collaborative whiteboard room. Live sync via Supabase broadcast,
// snapshot persistence to the `whiteboards` table. Works for logged-in
// staff and anonymous students (via shared link).
export default function BoardCanvas({ roomId, displayName = 'Guest', dark = false }) {
  const [api, setApi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userCount, setUserCount] = useState(1)
  const [saveState, setSaveState] = useState('saved') // saved | saving | dirty
  const channelRef = useRef(null)
  const applyingRemote = useRef(false)
  const lastBroadcast = useRef(0)
  const saveTimer = useRef(null)
  const initialData = useRef(null)
  const [ready, setReady] = useState(false)

  // Load initial scene from DB
  useEffect(() => {
    let cancelled = false
    supabase.from('whiteboards').select('scene').eq('room_id', roomId).maybeSingle().then(({ data }) => {
      if (cancelled) return
      const scene = data?.scene
      initialData.current = {
        elements: scene?.elements || [],
        appState: { viewBackgroundColor: dark ? '#0b0b0f' : '#ffffff' },
        scrollToContent: true,
      }
      setReady(true)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [roomId])

  // Set up realtime channel
  useEffect(() => {
    if (!api) return
    const channel = supabase.channel(`board:${roomId}`, {
      config: { broadcast: { self: false }, presence: { key: displayName } },
    })

    channel.on('broadcast', { event: 'scene' }, ({ payload }) => {
      if (!api) return
      applyingRemote.current = true
      api.updateScene({ elements: payload.elements })
      // reset guard on next tick
      setTimeout(() => { applyingRemote.current = false }, 0)
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setUserCount(Math.max(1, Object.keys(state).length))
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ name: displayName, at: Date.now() })
      }
    })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel); channelRef.current = null }
  }, [api, roomId, displayName])

  const persist = useCallback((elements) => {
    setSaveState('saving')
    supabase.from('whiteboards')
      .update({ scene: { elements }, updated_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .then(() => setSaveState('saved'))
  }, [roomId])

  const onChange = useCallback((elements) => {
    if (applyingRemote.current) return // don't echo remote updates back
    const ch = channelRef.current
    const now = Date.now()
    // Throttle live broadcast to ~every 90ms
    if (ch && now - lastBroadcast.current > 90) {
      lastBroadcast.current = now
      ch.send({ type: 'broadcast', event: 'scene', payload: { elements } })
    }
    // Debounced persistence
    setSaveState('dirty')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => persist(elements), 1500)
  }, [persist])

  return (
    <div className="relative w-full h-full">
      {/* Presence + save badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-full shadow-sm border border-gray-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {userCount} {userCount === 1 ? 'person' : 'people'}
        </span>
        <span className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-500 text-xs px-2.5 py-1.5 rounded-full shadow-sm border border-gray-100">
          {saveState === 'saving' ? <><Loader2 size={11} className="animate-spin" /> Saving</> : saveState === 'dirty' ? 'Editing…' : <><Check size={11} className="text-green-500" /> Saved</>}
        </span>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
          <Loader2 size={24} className="animate-spin text-violet-600" />
        </div>
      )}

      {ready && (
        <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 size={24} className="animate-spin text-violet-600" /></div>}>
          <Excalidraw
            excalidrawAPI={setApi}
            initialData={initialData.current}
            onChange={onChange}
            theme={dark ? 'dark' : 'light'}
            UIOptions={{ canvasActions: { loadScene: false } }}
          />
        </Suspense>
      )}
    </div>
  )
}
