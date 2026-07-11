'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, X, Clock, AlertCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface StudentAttendance {
  enrollmentId: string
  studentId: string
  rollNumber: string | null
  name: string
  email: string
  status: string
}

const statusOptions = [
  { value: 'PRESENT', label: 'Present', icon: Check, color: 'bg-green-500' },
  { value: 'ABSENT', label: 'Absent', icon: X, color: 'bg-red-500' },
  { value: 'LATE', label: 'Late', icon: Clock, color: 'bg-yellow-500' },
  { value: 'EXCUSED', label: 'Excused', icon: AlertCircle, color: 'bg-blue-500' },
]

export default function AttendancePage() {
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSection, setSelectedSection] = useState('')
  const [sections, setSections] = useState<{ id: string; name: string; className: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) fetchAttendance()
  }, [selectedSection, selectedDate])

  const fetchSections = async () => {
    try {
      const response = await api.get('/academics/sections')
      setSections(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch sections')
    }
  }

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/attendance/section/${selectedSection}?date=${selectedDate}`)
      setStudents(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = (enrollmentId: string, status: string) => {
    setStudents(prev => prev.map(s =>
      s.enrollmentId === enrollmentId ? { ...s, status } : s
    ))
  }

  const saveAttendance = async () => {
    setSaving(true)
    try {
      const enrollments = students.map(s => ({
        enrollmentId: s.enrollmentId,
        status: s.status,
      })).filter(s => s.status !== 'NOT_MARKED')

      await api.post('/attendance/bulk-mark', {
        enrollments,
        date: selectedDate,
      })
      toast.success('Attendance saved successfully')
    } catch (error) {
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'PRESENT').length,
    absent: students.filter(s => s.status === 'ABSENT').length,
    late: students.filter(s => s.status === 'LATE').length,
    excused: students.filter(s => s.status === 'EXCUSED').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Mark and track student attendance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.className} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSection && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
              <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
              <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
              <div className="w-6 h-6 bg-red-500 rounded-full mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
              <div className="w-6 h-6 bg-yellow-500 rounded-full mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-gray-500">Late</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
              <p className="text-xs text-gray-500">Excused</p>
            </div>
          </div>

          {/* Attendance List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Students</h2>
              <button onClick={saveAttendance} disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
                ) : students.map((student) => (
                  <tr key={student.enrollmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{student.rollNumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        {statusOptions.map((opt) => (
                          <button key={opt.value} onClick={() => updateStatus(student.enrollmentId, opt.value)}
                            className={`p-2 rounded-lg transition-all ${
                              student.status === opt.value
                                ? `${opt.color} text-white`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            <opt.icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
