'use client'

import { useState, useEffect } from 'react'
import { Plus, BookOpen, Calendar, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Exam {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  isActive: boolean
  academicYear: { name: string }
  _count: { results: number }
}

const examTypeColors: Record<string, string> = {
  QUIZ: 'bg-blue-100 text-blue-800',
  MIDTERM: 'bg-yellow-100 text-yellow-800',
  FINAL: 'bg-red-100 text-red-800',
  ASSIGNMENT: 'bg-green-100 text-green-800',
  PRACTICAL: 'bg-purple-100 text-purple-800',
  PROJECT: 'bg-pink-100 text-pink-800',
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'MIDTERM',
    startDate: '',
    endDate: '',
  })

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const response = await api.get('/exams')
      setExams(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch exams')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/exams', { ...formData, schoolId: 'placeholder', academicYearId: 'placeholder' })
      toast.success('Exam created successfully')
      setShowModal(false)
      fetchExams()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create exam')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600">Manage exams and view results</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> Create Exam
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exams yet</h3>
          <p className="text-gray-500 mb-4">Create your first examination</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Create Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${examTypeColors[exam.type] || 'bg-gray-100 text-gray-800'}`}>
                    {exam.type}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {exam.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {exam._count.results} results
                </div>
                <div className="text-xs text-gray-500">{exam.academicYear.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Exam</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required placeholder="e.g., Mid-Term Examination" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2">
                    <option value="QUIZ">Quiz</option>
                    <option value="MIDTERM">Mid-Term</option>
                    <option value="FINAL">Final</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PRACTICAL">Practical</option>
                    <option value="PROJECT">Project</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border p-2" required />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
