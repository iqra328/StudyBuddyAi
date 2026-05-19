import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import '../css/dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalNotes: 12,
    totalQuizzes: 8,
    totalSummaries: 15,
    studyTime: 42
  })

  const statCards = [
    { title: 'Total Notes', value: stats.totalNotes, icon: '📚', trend: '+12%', color: '#8b5cf6' },
    { title: 'Quizzes Taken', value: stats.totalQuizzes, icon: '📝', trend: '+8%', color: '#ec4899' },
    { title: 'AI Summaries', value: stats.totalSummaries, icon: '🤖', trend: '+15%', color: '#06b6d4' },
    { title: 'Study Hours', value: stats.studyTime, icon: '⏱️', trend: '+5%', color: '#10b981' },
  ]

  const recentActivities = [
    { action: 'Uploaded "React Notes"', time: '2 hours ago', icon: '📤' },
    { action: 'Generated AI Summary', time: '5 hours ago', icon: '🤖' },
    { action: 'Completed JavaScript Quiz', time: '1 day ago', icon: '✅' },
    { action: 'Created Flashcards', time: '2 days ago', icon: '🎴' },
  ]

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, {user?.name}! 
            <span className="wave">👋</span>
          </h1>
          <p className="welcome-subtitle">Ready to continue your learning journey?</p>
        </div>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="stat-header">
                <div className="stat-icon">{stat.icon}</div>
                <span className="stat-trend">↑ {stat.trend}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.title}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Activity Section */}
        <div className="activity-section">
          <div className="activity-card">
            <div className="card-title">
              <span>📋</span> Recent Activity
            </div>
            {recentActivities.map((activity, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-title">{activity.action}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="activity-card">
            <div className="card-title">
              <span>⚡</span> Quick Actions
            </div>
            <div className="quick-actions">
              <div className="action-btn">
                <div className="action-icon">📤</div>
                <div className="action-label">Upload Notes</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">🤖</div>
                <div className="action-label">Generate Quiz</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">📝</div>
                <div className="action-label">Create Summary</div>
              </div>
              <div className="action-btn">
                <div className="action-icon">📊</div>
                <div className="action-label">View Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard