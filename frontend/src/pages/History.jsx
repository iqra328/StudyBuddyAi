import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// ✅ Production API URL
const API_URL = 'https://studybuddyai-1.onrender.com/api'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No token found')
        setLoading(false)
        return
      }
      
      // ✅ Fixed: Using production API URL
      const response = await axios.get(`${API_URL}/history/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('History data:', response.data)
      setHistory(response.data)
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const deleteHistoryItem = async (id, type) => {
    try {
      const token = localStorage.getItem('token')
      // ✅ Fixed: Using production API URL
      await axios.delete(`${API_URL}/history/${id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Deleted successfully')
      fetchHistory()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete')
    }
  }

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    if (filter === 'notes') return item.type === 'note'
    if (filter === 'quizzes') return item.type === 'quiz'
    return true
  })

  // Helper function to get icon
  const getIcon = (item) => {
    if (item.icon) return item.icon
    if (item.type === 'note') return '📤'
    if (item.type === 'quiz') return '📝'
    if (item.action === 'Uploaded') return '📤'
    if (item.action === 'Generated Quiz') return '📝'
    return '📌'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <Sidebar />
      
      <div className="ml-64 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">History & Saved Content</h1>
          <p className="text-white/70 mt-2">View all your uploaded notes, summaries, and quiz attempts</p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('notes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'notes' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📤 Notes
          </button>
          <button
            onClick={() => setFilter('quizzes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'quizzes' 
                ? 'bg-white text-purple-600' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📝 Quizzes
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-white/70 mt-4">Loading history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/70">No history yet</p>
              <p className="text-white/50 text-sm mt-2">Upload notes or take quizzes to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center flex-1">
                    <div className="text-3xl mr-4">{getIcon(item)}</div>
                    <div>
                      <p className="text-white font-medium">{item.title || item.action || 'Activity'}</p>
                      <p className="text-white/50 text-sm">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'} • {item.action || 'Activity'}
                      </p>
                      {item.details && (
                        <p className="text-white/40 text-xs mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHistoryItem(item.id, item.type)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all px-3 py-1 rounded-lg"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default History