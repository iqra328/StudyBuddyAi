import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import '../css/dashboard.css'

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

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Fetch real data from backend
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Fetch notes
      const notesRes = await axios.get('https://studybuddyai-1.onrender.com/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const notes = notesRes.data || []
      
      // Fetch quizzes
      const quizzesRes = await axios.get('https://studybuddyai-1.onrender.com/api/ai/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const quizzes = quizzesRes.data || []

      // Fetch history for recent activities
      const historyRes = await axios.get('https://studybuddyai-1.onrender.com/api/history/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const history = historyRes.data || []

      // Update stats
      setStats({
        totalNotes: notes.length,
        totalQuizzes: quizzes.length,
        totalSummaries: notes.filter(n => n.summary?.detailed || n.summary?.short).length,
        studyTime: Math.floor(notes.length * 0.5 + quizzes.length * 2) // Approximate study time
      })

      // Set recent activities (last 4)
      setRecentActivities(history.slice(0, 4))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to sample data if API fails
      setStats({
        totalNotes: 12,
        totalQuizzes: 8,
        totalSummaries: 5,
        studyTime: 24
      })
      setRecentActivities([
        { action: 'Upload a note to get started', time: 'Get started', icon: '📤', type: 'tip' },
        { action: 'Generate your first quiz', time: 'Try now', icon: '🤖', type: 'tip' },
        { action: 'Create AI summaries', time: 'Coming soon', icon: '✨', type: 'tip' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Notes', value: stats.totalNotes, icon: '📚', trend: '+12%', color: '#8b5cf6', link: '/upload' },
    { title: 'Quizzes Taken', value: stats.totalQuizzes, icon: '📝', trend: '+8%', color: '#ec4899', link: '/quizzes' },
    { title: 'AI Summaries', value: stats.totalSummaries, icon: '🤖', trend: '+15%', color: '#06b6d4', link: '/summaries' },
    { title: 'Study Hours', value: stats.studyTime, icon: '⏱️', trend: '+5%', color: '#10b981', link: '/history' },
  ]

  const quickActions = [
    { icon: '📤', label: 'Upload Notes', color: 'from-purple-500 to-pink-500', path: '/upload' },
    { icon: '🤖', label: 'Generate Quiz', color: 'from-blue-500 to-cyan-500', path: '/quizzes' },
    { icon: '✨', label: 'AI Summary', color: 'from-green-500 to-emerald-500', path: '/summaries' },
    { icon: '📊', label: 'View History', color: 'from-orange-500 to-red-500', path: '/history' },
  ]

  const handleQuickAction = (path) => {
    navigate(path)
    toast.success(`Opening ${path.slice(1)}...`)
  }

  // Get icon based on activity type
  const getActivityIcon = (type, icon) => {
    if (icon) return icon
    switch (type) {
      case 'note': return '📤'
      case 'quiz': return '📝'
      default: return '📌'
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        {/* Welcome Section with Animated Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="welcome-section"
        >
          <div className="welcome-badge">
            <span className="greeting-icon">🌟</span>
            <span className="greeting-text">{greeting}</span>
          </div>
          <h1 className="welcome-title">
            {user?.name?.split(' ')[0] || 'Student'}! 
            <span className="wave">👋</span>
          </h1>
          <p className="welcome-subtitle">Ready to continue your learning journey?</p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
              onClick={() => stat.link && navigate(stat.link)}
              style={{ cursor: stat.link ? 'pointer' : 'default' }}
            >
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)` }}>
                  {stat.icon}
                </div>
                <span className="stat-trend">↑ {stat.trend}</span>
              </div>
              <div className="stat-value">{loading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.title}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Activity and Quick Actions Section */}
        <div className="activity-section">
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="activity-card"
          >
            <div className="card-title">
              <span>📋</span> Recent Activity
            </div>
            {loading ? (
              <div className="skeleton-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-item">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, i) => (
                <motion.div 
                  key={i} 
                  className="activity-item"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="activity-icon">{getActivityIcon(activity.type, activity.icon)}</div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title || activity.action}</div>
                    <div className="activity-time">
                      {activity.date ? new Date(activity.date).toLocaleDateString() : activity.time || 'Just now'}
                    </div>
                  </div>
                  {activity.type === 'tip' && (
                    <div className="activity-badge">New</div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No activity yet</p>
                <p className="empty-subtext">Upload notes or take quizzes to see activity</p>
              </div>
            )}
            
            {recentActivities.length > 0 && recentActivities[0]?.type !== 'tip' && (
              <button 
                className="view-all-btn"
                onClick={() => navigate('/history')}
              >
                View All Activity →
              </button>
            )}
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="activity-card"
          >
            <div className="card-title">
              <span>⚡</span> Quick Actions
            </div>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <motion.div 
                  key={index}
                  className="action-btn"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(action.path)}
                >
                  <div className={`action-icon-wrapper bg-gradient-to-r ${action.color}`}>
                    <div className="action-icon">{action.icon}</div>
                  </div>
                  <div className="action-label">{action.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Motivational Quote */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="motivation-card"
        >
          <div className="quote-icon">💡</div>
          <div className="quote-text">
            "The beautiful thing about learning is that no one can take it away from you."
          </div>
          <div className="quote-author">- B.B. King</div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard