import { useState, useRef, useCallback, Suspense, lazy, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PenTool, Loader2, Users, Copy, Check, Wifi } from 'lucide-react'

const Excalidraw = lazy(() => import('@excalidraw/excalidraw').then(m => ({ default: m.Excalidraw })))
import '@excalidraw/excalidraw/index.css'

export default function Whiteboard() {
  const { mode } = useTheme()
  const { profile } = useAuth()
  const [room, setRoom] = useState('')
  const [joined, setJoined] = useState(false)

  if (!joined) {
    return <RoomPicker onJoin={r => { setRoom(r); setJoined(true) }} />
  }
  return <Board room={room} mode={mode} profile={profile} onLeave={() => setJoined(false)} />
}

function RoomPicker({ onJoin }) {
  const [code, setCode] = useState('')
  const randomRoom = () => Math.random().toString(36).slice(2, 8).toUpperCase()

  return (
    <div className="space-y-6 max-w-lg fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <PenTool size={30} /> Whiteboard
        </h1>
        <p className="text-gray-500 text-[15px] mt-1.5">Draw and diagram live with your student — together, in real time.</p>
      </div>

      <div className="card p-6 space-y-4">
        <button onClick={() => onJoin(randomRoom())}
          className="w-full btn-primary py-3.5 text-base justify-center">
          <PenTool size={18} /> Start a new board
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" /> or join existing <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter room code (e.g. AB3X9K)" className="input flex-1 uppercase tracking-widest font-mono" />
          <button onClick={() => code.trim() && onJoin(code.trim())} disabled={!code.trim()}
            className="btn-primary disabled:opacity-50">Join</button>
        </div>
        <p className="text-xs text-gray-400">Share the room code with your student so you both draw on the same canvas.</p>
      </div>
    </div>
  )
}

function Board({ room, mode, profile, onLeave }) {
  const [api, setApi] = useState(null)
  const [peers, setPeers] = useState(0)
  const [copied, setCopied] = useState(false)
  const channelRef = useRef(null)
  const applyingRemote = useRef(false)
  const lastSent = useRef(0)
  const myName = profile?.name || profile?.email || 'Tutor'

  // Set up the realtime channel
  useEffect(() => {
    const channel = supabase.channel(`wb-${room}`, { config: { broadcast: { self: false }, presence: { key: profile?.id || 'anon' } } })

    channel
      .on('broadcast', { event: 'scene' }, ({ payload }) => {
        if (!api) return
        applyingRemote.current = true
        api.updateScene({ elements: payload.elements })
        // small delay so our own onChange doesn't echo
        setTimeout(() => { applyingRemote.current = false }, 50)
      })
      .on('broadcast', { event: 'request' }, () => {
        // a new peer asked for current state — send ours
        if (api) channel.send({ type: 'broadcast', event: 'scene', payload: { elements: api.getSceneElements() } })
      })
      .on('presence', { sync: () => {
        const state = channel.presenceState()
        setPeers(Object.keys(state).length)
      }})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: myName, at: Date.now() })
          // ask existing peers for the current canvas
          channel.send({ type: 'broadcast', event: 'request', payload: {} })
        }
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [room, api])

  const onChange = useCallback((elements) => {
    if (applyingRemote.current || !channelRef.current) return
    const now = Date.now()
    if (now - lastSent.current < 60) return // throttle ~16fps
    lastSent.current = now
    channelRef.current.send({ type: 'broadcast', event: 'scene', payload: { elements } })
  }, [])

  function copyCode() {
    navigator.clipboard.writeText(room)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 h-[calc(100vh-130px)] flex flex-col fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><PenTool size={26} /> Whiteboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
            <Wifi size={13} className="text-green-500" /> Live · {peers} {peers === 1 ? 'person' : 'people'} connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyCode} className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold font-mono tracking-widest">
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> {room}</>}
          </button>
          <button onClick={onLeave} className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">Leave</button>
        </div>
      </div>

      <div className="card flex-1 overflow-hidden rounded-3xl">
        <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 size={28} className="text-violet-600 animate-spin" /></div>}>
          <Excalidraw
            excalidrawAPI={setApi}
            onChange={onChange}
            theme={mode === 'dark' ? 'dark' : 'light'}
          />
        </Suspense>
      </div>
    </div>
  )
}
