// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  HomeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { dashboardService } from '@/services/dashboard.service'
import Spinner, { FullPageSpinner } from '@/components/common/Spinner'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [activities, setActivities] = useState([])
  const [error, setError] = useState(null)


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsData, trendsData, activitiesData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRegistrationTrends(),
          dashboardService.getRecentActivities()
        ])

        setStats(statsData)
        setTrends(trendsData)
        setActivities(activitiesData)
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError('Failed to load dashboard data')
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="relative overflow-hidden">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  )

  const ActivityItem = ({ activity }) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg">
        <div className={`p-2 rounded-full ${
          activity.type === 'registration' ? 'bg-blue-100' :
          activity.type === 'transfer' ? 'bg-purple-100' : 'bg-red-100'
        }`}>
          {activity.type === 'registration' && <DocumentTextIcon className="h-5 w-5 text-blue-600" />}
          {activity.type === 'transfer' && <ClockIcon className="h-5 w-5 text-purple-600" />}
          {activity.type === 'dispute' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <p className="text-sm text-gray-500">{activity.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date(activity.date).toLocaleDateString()}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[activity.status]}`}>
            {activity.status}
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return <FullPageSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon={HomeIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Verified Properties"
          value={stats?.verifiedProperties || 0}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Unverified Properties"
          value={stats?.unverifiedProperties || 0}
          icon={DocumentTextIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Transfers"
          value={stats?.totalTransfers || 0}
          icon={ArrowPathIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Chart Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Registration Trends</h2>
          <div className="mt-4" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="registrations" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]} // Rounded top corners
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Recent Activities */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard