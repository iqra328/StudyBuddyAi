import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Summaries = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'React Hooks Guide', date: '2024-01-15', hasSummary: false },
    { id: 2, title: 'JavaScript Fundamentals', date: '2024-01-14', hasSummary: true },
    { id: 3, title: 'CSS Grid Layout', date: '2024-01-13', hasSummary: false },
  ])
  
  const [selectedNote, setSelectedNote] = useState(null)
  const [summary, setSummary] = useState('')

  const generateSummary = async (note) => {
    toast.loading('Generating AI summary...', { id: 'summary' })
    setTimeout(() => {
      toast.success('Summary generated!', { id: 'summary' })
      setSummary(`This is an AI-generated summary of "${note.title}". It covers the key concepts and important points that you need to remember for your studies. The material focuses on practical applications and best practices.`)
    }, 2000)
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    toast.success('Copied to clipboard!')
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
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Notes</h2>
            <div className="space-y-3">
              {notes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${selectedNote?.id === note.id ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{note.title}</p>
                      <p className="text-white/50 text-sm">{note.date}</p>
                    </div>
                    {note.hasSummary && <span className="text-green-400 text-sm">✅ Summarized</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Summary Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">AI Generated Summary</h2>
            {selectedNote ? (
              <>
                <p className="text-white/80 mb-4">Selected: <span className="font-semibold">{selectedNote.title}</span></p>
                {!summary && (
                  <button 
                    onClick={() => generateSummary(selectedNote)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold mb-4"
                  >
                    Generate Summary 🤖
                  </button>
                )}
                
                {summary && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-lg">
                      <p className="text-white leading-relaxed">{summary}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={copySummary} className="flex-1 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all">
                        📋 Copy
                      </button>
                      <button className="flex-1 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all">
                        💾 Download
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