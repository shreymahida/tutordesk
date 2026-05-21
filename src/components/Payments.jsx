import { useState } from 'react'
import { useApp } from '../store'
import { Plus, X, DollarSign, CheckCircle, Printer } from 'lucide-react'

const METHODS = ['Cash', 'Venmo', 'Zelle', 'PayPal', 'Check', 'Bank Transfer', 'Other']

const BLANK = { studentId: '', amount: '', date: '', status: 'pending', method: '', notes: '' }

export default function Payments() {
  const { students, sessions, payments, addPayment, updatePayment, deletePayment } = useApp()
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [invoiceView, setInvoiceView] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const filtered = payments
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  function openAdd() { setForm({ ...BLANK, date: today }); setModal('add') }
  function openEdit(p) { setForm({ ...p }); setModal(p) }
  function closeModal() { setModal(null) }

  function handleSave() {
    if (!form.studentId || !form.amount) return
    if (modal === 'add') addPayment(form)
    else updatePayment(modal.id, form)
    closeModal()
  }

  function markPaid(id) {
    updatePayment(id, { status: 'paid', date: today })
  }

  function openInvoice(p) {
    const student = students.find(s => s.id === p.studentId)
    const session = sessions.find(s => s.id === p.sessionId)
    setInvoiceView({ payment: p, student, session })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-bold text-green-800 mt-1">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => {
              const student = students.find(s => s.id === p.studentId)
              return (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.invoiceNum}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.method || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {p.status === 'pending' && (
                        <button onClick={() => markPaid(p.id)} title="Mark paid" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => openInvoice(p)} title="View invoice" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => openEdit(p)} title="Edit" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <DollarSign size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
            <p>No payment records found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{modal === 'add' ? 'Add Payment' : 'Edit Payment'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} className="input">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input" placeholder="60.00" step="0.01" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="input">
                    <option value="">Select...</option>
                    {METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                    <option>pending</option>
                    <option>paid</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {invoiceView && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Invoice {invoiceView.payment.invoiceNum}</h2>
              <button onClick={() => setInvoiceView(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-xl p-5 mb-5">
                <p className="text-violet-200 text-xs uppercase tracking-wider mb-1">Invoice</p>
                <p className="text-xl font-bold">{invoiceView.payment.invoiceNum}</p>
              </div>
              <dl className="space-y-3 text-sm">
                <Row label="Student" value={invoiceView.student?.name || '—'} />
                <Row label="Subject" value={invoiceView.session?.subject || '—'} />
                <Row label="Date" value={formatDate(invoiceView.payment.date)} />
                <Row label="Duration" value={invoiceView.session ? `${invoiceView.session.duration} min` : '—'} />
                <Row label="Amount" value={`$${Number(invoiceView.payment.amount).toFixed(2)}`} bold />
                <Row label="Status" value={invoiceView.payment.status} />
                {invoiceView.payment.method && <Row label="Method" value={invoiceView.payment.method} />}
              </dl>
              <button onClick={() => window.print()} className="mt-5 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-gray-900 text-base' : 'font-medium text-gray-800'}>{value}</span>
    </div>
  )
}

function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
