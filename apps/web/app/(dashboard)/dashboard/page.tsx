'use client'

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

const stats = [
  { name: 'Total Students', value: '1,234', change: '+12%', icon: GraduationCap, color: 'bg-blue-500' },
  { name: 'Total Teachers', value: '89', change: '+5%', icon: Users, color: 'bg-green-500' },
  { name: 'Active Classes', value: '42', change: '+2%', icon: BookOpen, color: 'bg-purple-500' },
  { name: 'Revenue', value: '$45,231', change: '+18%', icon: DollarSign, color: 'bg-yellow-500' },
]

const recentActivities = [
  { id: 1, type: 'admission', message: 'New admission application from Sarah Johnson', time: '5 minutes ago', status: 'pending' },
  { id: 2, type: 'payment', message: 'Fee payment received from John Smith - $500', time: '15 minutes ago', status: 'completed' },
  { id: 3, type: 'attendance', message: 'Attendance marked for Class 10-A', time: '1 hour ago', status: 'completed' },
  { id: 4, type: 'exam', message: 'Mid-term exam results published', time: '2 hours ago', status: 'completed' },
  { id: 5, type: 'alert', message: 'Low attendance alert for Class 8-B', time: '3 hours ago', status: 'warning' },
]

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: '2024-02-15', time: '10:00 AM' },
  { id: 2, title: 'Annual Day Celebration', date: '2024-02-20', time: '9:00 AM' },
  { id: 3, title: 'Exam Period Begins', date: '2024-02-25', time: 'All Day' },
  { id: 4, title: 'Staff Training Workshop', date: '2024-03-01', time: '2:00 PM' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your school.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-100' :
                    activity.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <GraduationCap className="h-6 w-6 text-blue-500 mb-2" />
            <p className="font-medium text-gray-900">Add Student</p>
            <p className="text-sm text-gray-500">Register new student</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users className="h-6 w-6 text-green-500 mb-2" />
            <p className="font-medium text-gray-900">Add Teacher</p>
            <p className="text-sm text-gray-500">Register new teacher</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
            <p className="font-medium text-gray-900">Create Class</p>
            <p className="text-sm text-gray-500">Setup new class</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <DollarSign className="h-6 w-6 text-yellow-500 mb-2" />
            <p className="font-medium text-gray-900">Record Payment</p>
            <p className="text-sm text-gray-500">Log fee payment</p>
          </button>
        </div>
      </div>
    </div>
  )
}
