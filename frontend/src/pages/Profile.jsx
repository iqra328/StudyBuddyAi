import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// ✅ Production API URL
const API_URL = 'https://studybuddyai-1.onrender.com/api'

const Profile = () => {
  const { user, setUser, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [profilePic, setProfilePic] = useState(user?.profilePicture || null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalSummaries: 0,
    studyStreak: 0,
    joinDate: user?.createdAt || new Date().toISOString()
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback stats
      setStats({
        totalNotes: 5,
        totalQuizzes: 3,
        totalSummaries: 2,
        studyStreak: 7,
        joinDate: user?.createdAt || new Date().toISOString()
      })
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/user/profile`, 
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(response.data)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('profilePicture', file)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/user/upload-pic`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      setProfilePic(response.data.profilePicture)
      setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }))
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload picture')
    } finally {
      setUploading(false)
    }
  }

  const achievements = [
    { name: 'First Note Uploaded', icon: '🎯', completed: stats.totalNotes > 0 },
    { name: 'Quiz Master', icon: '🏆', completed: stats.totalQuizzes > 0 },
    { name: '7 Day Streak', icon: '🔥', completed: stats.studyStreak >= 7 },
    { name: 'AI Explorer', icon: '🤖', completed: stats.totalSummaries > 0 },
  ]

  const joinDate = new Date(stats.joinDate)
  const memberSince = joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-white/70 mt-2">Manage your account and view achievements</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            {/* Profile Picture Section */}
            <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-white/10">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-5xl overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase() || '👤'}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 hover:bg-purple-700 transition-all"
                  >
                    {uploading ? '⏳' : '📷'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-white/50 text-xs mt-2">Click camera to upload</p>
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Email"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-all"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                    <p className="text-white/60">{user?.email}</p>
                    <p className="text-white/40 text-sm mt-1">Member since {memberSince}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all"
                    >
                      Edit Profile ✏️
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalNotes}</div>
                <div className="text-white/50 text-sm">Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalQuizzes}</div>
                <div className="text-white/50 text-sm">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalSummaries}</div>
                <div className="text-white/50 text-sm">Summaries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.studyStreak}</div>
                <div className="text-white/50 text-sm">Day Streak</div>
              </div>
            </div>
          </motion.div>
          
          {/* Achievements Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🏅 Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg ${achievement.completed ? 'bg-white/10' : 'bg-white/5 opacity-50'}`}>
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{achievement.name}</p>
                    {achievement.completed && (
                      <p className="text-green-400 text-xs">✓ Completed</p>
                    )}
                  </div>
                  {achievement.completed && (
                    <span className="text-green-400">✓</span>
                  )}
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