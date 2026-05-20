import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'https://studybuddyai-1.onrender.com/api'

const Summaries = () => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login first')
        setLoading(false)
        return
      }

      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setNotes(response.data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async (note) => {
    if (!note) return
    
    setGenerating(true)
    const toastId = toast.loading('🤖 Generating AI summary...')
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(`${API_URL}/ai/summary`, 
        { noteId: note._id, type: 'detailed' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setSummary(response.data.summary)
      toast.success('✨ Summary generated successfully!', { id: toastId })
      
      setNotes(prev => prev.map(n => 
        n._id === note._id ? { ...n, hasSummary: true } : n
      ))
      
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Failed to generate summary. Please try again.', { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  const copySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      toast.success('📋 Copied to clipboard!')
    }
  }

  const downloadSummary = () => {
    if (summary) {
      const element = document.createElement('a')
      const file = new Blob([summary], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${selectedNote?.title || 'summary'}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success('💾 Downloaded successfully!')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Loading your notes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      {/* Main Content - with proper margin to avoid sidebar overlap */}
      <div style={{ marginLeft: '280px', padding: '30px', minHeight: '100vh' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">🤖 AI Summaries</h1>
          <p className="text-white/70 mt-2">Generate smart summaries from your study notes</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes List Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                📚 Your Notes
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{notes.length}</span>
              </h2>
            </div>
            
            <div className="p-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-white/60">No notes found</p>
                  <p className="text-white/40 text-sm mt-1">Upload some notes first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <div 
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note)
                        setSummary(note.summary?.detailed || '')
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedNote?._id === note._id 
                          ? 'bg-purple-600/40 border border-purple-500' 
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{note.title}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(note.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {note.summary?.detailed && (
                          <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
                            ✅ Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Summary Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                ✨ AI Generated Summary
              </h2>
            </div>
            
            <div className="p-5">
              {selectedNote ? (
                <>
                  <div className="mb-4 p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
                    <p className="text-purple-300 text-sm">Selected Note</p>
                    <p className="text-white font-medium">{selectedNote.title}</p>
                  </div>
                  
                  {!summary && !selectedNote.summary?.detailed && (
                    <button 
                      onClick={() => generateSummary(selectedNote)}
                      disabled={generating}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                    >
                      {generating ? '🤖 Generating...' : '✨ Generate Summary'}
                    </button>
                  )}
                  
                  {(summary || selectedNote.summary?.detailed) && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                          {summary || selectedNote.summary?.detailed}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={copySummary} 
                          className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          📋 Copy
                        </button>
                        <button 
                          onClick={downloadSummary} 
                          className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          💾 Download
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-white/60">Select a note</p>
                  <p className="text-white/40 text-sm mt-1">Choose a note from the left panel</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Summaries