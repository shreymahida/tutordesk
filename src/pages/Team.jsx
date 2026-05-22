import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, Shield, UserCheck, Mail, X, RefreshCw, Trash2 } from 'lucide-react'

export default function Team() {
  const { profile: myProfile, isAdmin, inviteTutor } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setProfiles(data || [])
    setLoading(false)
  }

  async function changeRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    setProfiles(p => p.map(x => x.id === id ? { ...x, role } : x))
  }

  async function removeProfile(id) {
    await supabase.from('profiles').delete().eq('id', id)
    setProfiles(p => p.filter(x => x.id !== id))
    setConfirmRemove(null)
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviteLoading(true)
    setInviteStatus('')
    const err = await inviteTutor(inviteEmail)
    if (err) setInviteStatus('Error: ' + err.message)
    else { setInviteStatus('Invite sent! They will receive a magic link to log in.'); setInviteEmail('') }
    setInviteLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-1">{profiles.length} team member{profiles.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setInviteModal(true); setInviteStatus('') }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Mail size={16} /> Invite Tutor
          </button>
        )}
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={15} className="text-violet-600" />
            <span className="font-medium text-violet-900 text-sm">Admin</span>
          </div>
          <p className="text-xs text-violet-700">Full access — manage students, sessions, payments, team, and settings.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={15} className="text-gray-600" />
            <span className="font-medium text-gray-900 text-sm">Tutor</span>
          </div>
          <p className="text-xs text-gray-600">Can view and manage students, sessions, and progress notes.</p>
        </div>
      </div>

      {/* Team list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <RefreshCw size={20} className="mx-auto mb-2 animate-spin opacity-40" />
            <p className="text-sm">Loading team...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50/50 ${p.id === myProfile?.id ? 'bg-violet-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
                        {(p.name || p.email || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {p.name || '—'}
                        {p.id === myProfile?.id && <span className="ml-1.5 text-xs text-violet-500">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {p.id !== myProfile?.id && (
                        <div className="flex items-center gap-3 justify-end">
                          <button
                            onClick={() => changeRole(p.id, p.role === 'admin' ? 'tutor' : 'admin')}
                            className="text-xs text-violet-600 hover:underline">
                            Make {p.role === 'admin' ? 'tutor' : 'admin'}
                          </button>
                          <button
                            onClick={() => setConfirmRemove(p)}
                            className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {profiles.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-400">
          <Users size={32} className="mx-auto mb-2 opacity-30" />
          <p>No team members yet.</p>
        </div>
      )}

      {/* Invite modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Invite a Tutor</h2>
              <button onClick={() => setInviteModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Enter their email address. They'll receive a magic link to sign in — no password needed.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="input"
                  placeholder="tutor@example.com"
                  required
                />
              </div>
              {inviteStatus && (
                <p className={`text-sm ${inviteStatus.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
                  {inviteStatus}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setInviteModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={inviteLoading} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium">
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirm */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Remove {confirmRemove.name || confirmRemove.email}?</h2>
            <p className="text-gray-600 text-sm mb-2">
              They'll lose all access to TutorHQ immediately. Their existing data (students, sessions, payments) stays in the system.
            </p>
            <p className="text-gray-400 text-xs mb-5">
              To fully delete their login account, also go to Supabase → Authentication → Users → find {confirmRemove.email} → delete.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => removeProfile(confirmRemove.id)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Remove access</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
