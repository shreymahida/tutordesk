import { useState } from 'react'
import { useApp } from '../store'
import { Inbox, Mail, Phone, ChevronRight, Check, X, Copy, ExternalLink, Trash2 } from 'lucide-react'

export default function Leads() {
  const { leads, updateLead, deleteLead, addStudent, addFamily, settings, updateSettings } = useApp()
  const [filter, setFilter] = useState('new')
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(false)

  const filtered = leads.filter(l => filter === 'all' || l.status === filter)
  const bookingUrl = `${window.location.origin}/book`

  async function convertToStudent(lead) {
    // Create a family first
    const family = await addFamily({
      parentName: lead.parentName,
      parentEmail: lead.parentEmail,
      parentPhone: lead.parentPhone,
    })
    if (family) {
      await addStudent({
        name: lead.studentName,
        grade: lead.studentGrade || '9th',
        subjects: lead.subjects || [],
        rate: 0,
        status: 'active',
        familyId: family.id,
        notes: lead.message || '',
      })
    }
    await updateLead(lead.id, { status: 'converted' })
  }

  function copyBookingUrl() {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Inquiries from your public booking page</p>
        </div>
      </div>

      {/* Public booking link */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-violet-900 mb-1">Your public booking page</p>
          <p className="text-xs text-violet-700 break-all">{bookingUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-violet-700">
            <input type="checkbox" checked={settings?.bookingEnabled ?? true} onChange={e => updateSettings({ bookingEnabled: e.target.checked })} />
            Enabled
          </label>
          <button onClick={copyBookingUrl} className="text-xs bg-white border border-violet-200 hover:border-violet-400 text-violet-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
          <a href={bookingUrl} target="_blank" rel="noreferrer" className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
            <ExternalLink size={12} /> Preview
          </a>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['new', 'contacted', 'converted', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
            {f} {f === 'new' && leads.filter(l => l.status === 'new').length > 0 && <span className="ml-1 bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded">{leads.filter(l => l.status === 'new').length}</span>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Inbox size={32} className="mx-auto mb-2 opacity-30" />
            <p>No {filter !== 'all' ? filter : ''} leads.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(lead => {
              const isOpen = expanded === lead.id
              return (
                <div key={lead.id}>
                  <button onClick={() => setExpanded(isOpen ? null : lead.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{lead.parentName}</p>
                        <StatusBadge status={lead.status} />
                        <span className="text-xs text-gray-400">{formatRelative(lead.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Student: {lead.studentName} ({lead.studentGrade}) · {lead.subjects?.join(', ')}</p>
                    </div>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 bg-gray-50/50 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <Info icon={<Mail size={12} />} label="Email" value={lead.parentEmail} />
                        <Info icon={<Phone size={12} />} label="Phone" value={lead.parentPhone || '—'} />
                      </div>
                      {lead.message && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                          <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{lead.message}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {lead.status === 'new' && (
                          <button onClick={() => updateLead(lead.id, { status: 'contacted' })}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                            Mark contacted
                          </button>
                        )}
                        {lead.status !== 'converted' && (
                          <button onClick={() => convertToStudent(lead)}
                            className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium">
                            Convert to student
                          </button>
                        )}
                        {lead.status !== 'rejected' && (
                          <button onClick={() => updateLead(lead.id, { status: 'rejected' })}
                            className="text-xs bg-white border border-gray-200 hover:border-red-300 text-gray-600 px-3 py-1.5 rounded-lg font-medium">
                            Reject
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Delete this lead?')) deleteLead(lead.id) }}
                          className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 ml-auto">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    new: 'bg-violet-100 text-violet-700',
    contacted: 'bg-blue-50 text-blue-700',
    converted: 'bg-green-50 text-green-700',
    rejected: 'bg-gray-100 text-gray-500',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status]}`}>{status}</span>
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  )
}

function formatRelative(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
