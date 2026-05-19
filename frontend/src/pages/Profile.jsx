import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = () => {
    toast.success('Profile updated successfully!')
    setIsEditing(false)
  }

  const achievements = [
    { name: 'First Note Uploaded', icon: '🎯', date: '2024-01-15' },
    { name: 'Quiz Master', icon: '🏆', date: '2024-01-14' },
    { name: '7 Day Streak', icon: '🔥', date: '2024-01-13' },
  ]

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-white/70 mt-2">Manage your account and view achievements</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl mb-4">
                👨‍🎓
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg text-center w-full"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{name}</h2>
              )}
              <p className="text-white/60">{user?.email}</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
              <button className="w-full py-2 bg-white/20 text-white rounded-lg font-semibold">
                Change Password
              </button>
            </div>
          </motion.div>
          
          {/* Achievements */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">🏅 Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{achievement.name}</p>
                    <p className="text-white/50 text-sm">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile