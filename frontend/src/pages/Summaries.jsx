import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import '../css/dashboard.css'   // ✅ IMPORTANT

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
      console.log('Fetched notes:', response.data)
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
      toast.success('Summary generated!', { id: 'summary' })
    } catch (error) {
      toast.error('Failed to generate summary', { id: 'summary' })
    } finally {
      setGenerating(false)
    }
  }

  const copySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      toast.success('Copied!')
    }
  }

  const downloadSummary = () => {
    if (summary) {
      const element = document.createElement('a')
      const file = new Blob([summary], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${selectedNote?.title || 'summary'}.txt`
      element.click()
      toast.success('Downloaded!')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <h1 className="text-3xl font-bold text-white mb-4">🤖 AI Summaries</h1>
        <p className="text-white/70 mb-6">Generate smart summaries from your study notes</p>

        {notes.length === 0 ? (
          <div className="bg-white/10 rounded-xl p-8 text-center">
            <p className="text-white/60">No notes found. Please upload some notes first.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Notes List */}
            <div className="bg-white/10 rounded-xl p-4 max-h-96 overflow-auto">
              <h2 className="text-white font-semibold mb-3">Your Notes</h2>
              {notes.map(note => (
                <div
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note)
                    setSummary(note.summary?.detailed || '')
                  }}
                  className={`p-3 rounded-lg cursor-pointer mb-2 ${
                    selectedNote?._id === note._id ? 'bg-purple-600/40' : 'hover:bg-white/10'
                  }`}
                >
                  <p className="text-white">{note.title}</p>
                  <p className="text-white/40 text-xs">{new Date(note.uploadedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            {/* Summary Area */}
            <div className="bg-white/10 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-3">AI Summary</h2>
              {selectedNote ? (
                <>
                  <p className="text-purple-300 text-sm mb-2">Selected: {selectedNote.title}</p>
                  {!summary && !selectedNote.summary?.detailed && (
                    <button
                      onClick={() => generateSummary(selectedNote)}
                      disabled={generating}
                      className="bg-purple-600 px-4 py-2 rounded-lg text-white w-full"
                    >
                      {generating ? 'Generating...' : 'Generate Summary'}
                    </button>
                  )}
                  {(summary || selectedNote.summary?.detailed) && (
                    <>
                      <div className="bg-black/20 p-3 rounded-lg max-h-80 overflow-auto mt-3">
                        <p className="text-white/90 whitespace-pre-wrap">{summary || selectedNote.summary?.detailed}</p>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <button onClick={copySummary} className="bg-white/20 px-3 py-1 rounded">📋 Copy</button>
                        <button onClick={downloadSummary} className="bg-white/20 px-3 py-1 rounded">💾 Download</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-white/60">Select a note to see summary</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Summaries