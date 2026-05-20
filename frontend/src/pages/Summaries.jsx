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
    toast.loading('Generating AI summary...', { id: 'summary' })
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(`${API_URL}/ai/summary`, 
        { noteId: note._id, type: 'detailed' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setSummary(response.data.summary)
      toast.success('Summary generated successfully!', { id: 'summary' })
      
      const updatedNotes = notes.map(n => 
        n._id === note._id ? { ...n, hasSummary: true } : n
      )
      setNotes(updatedNotes)
      
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Failed to generate summary', { id: 'summary' })
    } finally {
      setGenerating(false)
    }
  }

  const copySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      toast.success('Copied to clipboard!')
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
      toast.success('Downloaded successfully!')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">AI Summaries</h1>
          <p className="text-white/70 mt-2">Generate smart summaries from your notes</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Notes</h2>
            {notes.length === 0 ? (
              <div className="text-center py-8 text-white/60">No notes found. Upload some notes first.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div 
                    key={note._id}
                    onClick={() => {
                      setSelectedNote(note)
                      setSummary(note.summary?.detailed || '')
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedNote?._id === note._id 
                        ? 'bg-purple-600/40 border border-purple-500' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{note.title}</p>
                        <p className="text-white/50 text-sm">
                          {new Date(note.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {note.summary?.detailed && (
                        <span className="text-green-400 text-sm">✅ Summarized</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Summary Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">AI Generated Summary</h2>
            {selectedNote ? (
              <>
                <p className="text-white/80 mb-4">Selected: <span className="font-semibold">{selectedNote.title}</span></p>
                {!summary && !selectedNote.summary?.detailed && (
                  <button 
                    onClick={() => generateSummary(selectedNote)}
                    disabled={generating}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold mb-4 disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate Summary'}
                  </button>
                )}
                
                {(summary || selectedNote.summary?.detailed) && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-lg max-h-96 overflow-y-auto">
                      <p className="text-white leading-relaxed whitespace-pre-wrap">
                        {summary || selectedNote.summary?.detailed}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={copySummary} className="flex-1 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all">
                        Copy
                      </button>
                      <button onClick={downloadSummary} className="flex-1 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all">
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-white/60 text-center py-8">Select a note to generate summary</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Summaries