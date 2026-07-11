'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface FeeStructure {
  id: string
  name: string
  description: string | null
  amount: number
  frequency: string
  isActive: boolean
  _count: { assignments: number }
}

interface FeeAssignment {
  id: string
  status: string
  dueDate: string
  feeStructure: { name: string; amount: number }
  student: { user: { profile: { firstName: string; lastName: string } } }
  totalPaid: number
  remaining: number
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  WAIVED: 'bg-gray-100 text-gray-800',
}

export default function FeesPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [assignments, setAssignments] = useState<FeeAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'structures' | 'assignments'>('structures')
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<FeeAssignment | null>(null)
  const [structureForm, setStructureForm] = useState({ name: '', description: '', amount: '', frequency: 'ANNUAL' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', notes: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [structRes, assignRes] = await Promise.all([
        api.get('/fees/structures'),
        api.get('/fees/assignments'),
      ])
      setStructures(structRes.data.data)
      setAssignments(assignRes.data.data)
    } catch (error) {
      toast.error('Failed to fetch fee data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/fees/structures', { ...structureForm, amount: parseFloat(structureForm.amount), schoolId: 'placeholder' })
      toast.success('Fee structure created')
      setShowStructureModal(false)
      setStructureForm({ name: '', description: '', amount: '', frequency: 'ANNUAL' })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create')
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return
    try {
      await api.post('/fees/payments', {
        feeAssignmentId: selectedAssignment.id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      })
      toast.success('Payment recorded')
      setShowPaymentModal(false)
      setSelectedAssignment(null)
      setPaymentForm({ amount: '', paymentMethod: 'CASH', notes: '' })
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment')
    }
  }

  const totalStats = {
    total: assignments.reduce((sum, a) => sum + a.feeStructure.amount, 0),
    paid: assignments.reduce((sum, a) => sum + a.totalPaid, 0),
    pending: assignments.reduce((sum, a) => sum + a.remaining, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage fee structures and payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">${totalStats.total.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">${totalStats.paid.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${totalStats.pending.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex">
            <button onClick={() => setActiveTab('structures')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'structures' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Fee Structures
            </button>
            <button onClick={() => setActiveTab('assignments')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'assignments' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Assignments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'structures' ? (
            <>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowStructureModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Structure
                </button>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {structures.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{s.name}</div>
                        {s.description && <div className="text-sm text-gray-500">{s.description}</div>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">${s.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.frequency}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s._count.assignments}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {a.student.user.profile.firstName} {a.student.user.profile.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.feeStructure.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold">${a.feeStructure.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600">${a.totalPaid.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[a.status] || 'bg-gray-100 text-gray-800'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.status !== 'PAID' && a.status !== 'WAIVED' && (
                        <button onClick={() => { setSelectedAssignment(a); setShowPaymentModal(true) }}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowStructureModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Fee Structure</h3>
              <form onSubmit={handleCreateStructure} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" value={structureForm.name} onChange={(e) => setStructureForm({...structureForm, name: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" value={structureForm.description} onChange={(e) => setStructureForm({...structureForm, description: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                    <input type="number" value={structureForm.amount} onChange={(e) => setStructureForm({...structureForm, amount: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select value={structureForm.frequency} onChange={(e) => setStructureForm({...structureForm, frequency: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2">
                      <option value="ONE_TIME">One Time</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="SEMESTER">Semester</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowStructureModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowPaymentModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Record Payment</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedAssignment.student.user.profile.firstName} {selectedAssignment.student.user.profile.lastName} - 
                {selectedAssignment.feeStructure.name} (Remaining: ${selectedAssignment.remaining.toLocaleString()})
              </p>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                  <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required min="0" step="0.01" max={selectedAssignment.remaining} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2">
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <input type="text" value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Record Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
