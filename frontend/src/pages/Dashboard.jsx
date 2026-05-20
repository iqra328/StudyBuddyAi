import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import toast from 'react-hot-toast'
import '../css/dashboard.css'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const API_URL = 'https://studybuddyai-1.onrender.com/api'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalSummaries: 0,
    studyTime: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const notesRes = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const notes = notesRes.data || []
      
      const quizzesRes = await axios.get(`${API_URL}/ai/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const quizzes = quizzesRes.data || []

      const historyRes = await axios.get(`${API_URL}/history/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const history = historyRes.data || []

      setStats({
        totalNotes: notes.length,
        totalQuizzes: quizzes.length,
        totalSummaries: notes.filter(n => n.summary?.detailed || n.summary?.short).length,
        studyTime: Math.floor(notes.length * 0.5 + quizzes.length * 2)
      })

      setRecentActivities(history.slice(0, 4))

      // Generate weekly activity data
      const weekly = [4, 3, 5, 2, 6, 4, 3] // Sample - can be real data later
      setWeeklyData(weekly)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pie Chart Data - Study Distribution
  const pieData = {
    labels: ['Notes', 'Quizzes', 'Summaries'],
    datasets: [
      {
        data: [stats.totalNotes, stats.totalQuizzes, stats.totalSummaries],
        backgroundColor: ['#8b5cf6', '#ec4899', '#06b6d4'],
        borderColor: ['rgba(255,255,255,0.2)'],
        borderWidth: 1,
      },
    ],
  }

  // Bar Chart Data - Weekly Activity
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Activities',
        data: weeklyData,
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 8,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'white' } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
      x: { ticks: { color: 'white' } },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'white' } },
    },
  }

  const statCards = [
    { title: 'Total Notes', value: stats.totalNotes, icon: '📚', trend: '+12%', link: '/upload' },
    { title: 'Quizzes Taken', value: stats.totalQuizzes, icon: '📝', trend: '+8%', link: '/quizzes' },
    { title: 'AI Summaries', value: stats.totalSummaries, icon: '🤖', trend: '+15%', link: '/summaries' },
    { title: 'Study Hours', value: stats.studyTime, icon: '⏱️', trend: '+5%', link: '/history' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <Sidebar />
      
      <div className="ml-64 p-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="welcome-badge">
            <span className="greeting-icon">🌟</span>
            <span className="greeting-text">{greeting}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {user?.name?.split(' ')[0] || 'Student'}! <span className="wave">👋</span>
          </h1>
          <p className="text-white/70 mt-1">Ready to continue your learning journey?</p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 cursor-pointer hover:bg-white/15 transition-all"
              onClick={() => stat.link && navigate(stat.link)}
            >
              <div className="flex justify-between items-start">
                <div className="text-3xl">{stat.icon}</div>
                <span className="text-green-400 text-sm">↑ {stat.trend}</span>
              </div>
              <div className="text-3xl font-bold text-white mt-3">{loading ? '...' : stat.value}</div>
              <div className="text-white/60 text-sm">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">📊 Study Distribution</h3>
            <div className="max-w-xs mx-auto">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">📈 Weekly Activity</h3>
            <Bar data={barData} options={barOptions} />
          </motion.div>
        </div>
        
        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">📋 Recent Activity</h3>
            {loading ? (
              <div className="text-center py-8 text-white/50">Loading...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10">
                  <div className="text-2xl">{item.icon || (item.type === 'note' ? '📤' : '📝')}</div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{item.title || item.action}</div>
                    <div className="text-white/40 text-xs">{item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50">No recent activity</div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📤', label: 'Upload Notes', path: '/upload' },
                { icon: '🤖', label: 'Generate Quiz', path: '/quizzes' },
                { icon: '✨', label: 'AI Summary', path: '/summaries' },
                { icon: '📊', label: 'View History', path: '/history' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all">
                  <div className="text-3xl mb-1">{action.icon}</div>
                  <div className="text-white text-sm">{action.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard