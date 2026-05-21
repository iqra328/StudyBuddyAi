import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import '../css/dashboard.css' 

const API_URL = 'https://studybuddyai-1.onrender.com/api'

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [generating, setGenerating] = useState(false)

  // Quiz taking state
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizActive, setQuizActive] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchQuizzes()
    fetchNotes()
  }, [])

  // Timer effect
  useEffect(() => {
    if (quizActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (quizActive && timeLeft === 0) {
      handleAutoSubmit()
    }
    return () => clearTimeout(timerRef.current)
  }, [quizActive, timeLeft])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/ai/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const generateQuiz = async () => {
    if (!selectedNote) {
      toast.error('Please select a note')
      return
    }

    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      // AI Quiz generation API call
      const response = await axios.post(`${API_URL}/ai/quiz/generate`, 
        {
          noteId: selectedNote,
          difficulty: difficulty,
          numberOfQuestions: questionCount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        toast.success('Quiz generated successfully!')
        setShowGenerateModal(false)
        fetchQuizzes()
        setSelectedNote('')
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.error('Failed to generate quiz')
    } finally {
      setGenerating(false)
    }
  }

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz)
    setAnswers({})
    setScore(null)
    setQuizActive(true)
    // Timer: 30 seconds per question (adjustable)
    const totalTime = quiz.questions.length * 30
    setTimeLeft(totalTime)
  }

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex })
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== currentQuiz.questions.length) {
      toast.error(`Please answer all ${currentQuiz.questions.length} questions`)
      return
    }

    setQuizActive(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/quiz/${currentQuiz._id}/submit`,
        { answers: Object.values(answers), timeTaken: (currentQuiz.questions.length * 30) - timeLeft },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setScore(response.data)
      toast.success(`You scored ${response.data.score}/${response.data.totalQuestions}`)
      
      // Refresh quiz list to update attempts
      fetchQuizzes()
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    }
  }

  const handleAutoSubmit = () => {
    if (!quizActive) return
    toast.error("Time's up! Submitting your answers...")
    handleSubmit()
  }

  const retryQuiz = () => {
    setCurrentQuiz(null)
    setAnswers({})
    setScore(null)
    setQuizActive(false)
    setTimeLeft(0)
    startQuiz(currentQuiz) // Restart same quiz
  }

  const resetQuiz = () => {
    setCurrentQuiz(null)
    setAnswers({})
    setScore(null)
    setQuizActive(false)
    setTimeLeft(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📝 AI Quiz Generator</h1>
            <p className="text-white/70 mt-2">Create and take smart quizzes from your notes</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg text-white font-semibold transition"
          >
            + Generate New Quiz
          </button>
        </div>

        {/* Quiz List */}
        {!currentQuiz ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 hover:scale-105 transition cursor-pointer"
                onClick={() => startQuiz(quiz)}
              >
                <div className="text-3xl mb-2">📋</div>
                <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                <div className="flex justify-between mt-2 text-white/60">
                  <span>{quiz.questions?.length || 0} Questions</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    quiz.difficulty === 'Easy' ? 'bg-green-500/30 text-green-300' :
                    quiz.difficulty === 'Medium' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-red-500/30 text-red-300'
                  }`}>{quiz.difficulty}</span>
                </div>
                <div className="mt-3 text-sm text-white/40">
                  Attempts: {quiz.attempts?.length || 0}
                  {quiz.attempts?.length > 0 && ` | Best: ${Math.max(...quiz.attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)))}%`}
                </div>
                <button className="mt-3 w-full bg-white/20 py-1.5 rounded-lg text-white font-medium">Start Quiz →</button>
              </motion.div>
            ))}
            {quizzes.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-white/60">No quizzes yet. Generate your first quiz!</div>
            )}
          </div>
        ) : (
          // Active Quiz View
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            {/* Timer */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{currentQuiz.title}</h2>
              <div className="bg-black/30 px-4 py-1 rounded-full text-yellow-300 font-mono text-xl">
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4 text-white/70 text-sm">
              Question {Object.keys(answers).length + 1} of {currentQuiz.questions.length}
            </div>

            {/* Questions */}
            <AnimatePresence mode="wait">
              {currentQuiz.questions.map((q, qIdx) => (
                <motion.div
                  key={qIdx}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="mb-6 p-4 bg-white/5 rounded-xl"
                >
                  <p className="text-white font-medium mb-3">{qIdx+1}. {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`flex items-center p-2 rounded-lg cursor-pointer transition ${answers[qIdx] === optIdx ? 'bg-purple-600/50' : 'hover:bg-white/10'}`}>
                        <input
                          type="radio"
                          name={`q${qIdx}`}
                          value={optIdx}
                          checked={answers[qIdx] === optIdx}
                          onChange={() => handleAnswer(qIdx, optIdx)}
                          className="mr-3"
                        />
                        <span className="text-white/90">{opt}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-white font-semibold"
              >
                Submit Quiz
              </button>
              <button
                onClick={resetQuiz}
                className="px-4 bg-white/20 hover:bg-white/30 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Score Modal / Result View */}
        {score && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-3">{score.percentage >= 70 ? '🎉' : score.percentage >= 40 ? '👍' : '📚'}</div>
              <h2 className="text-2xl font-bold mb-2">Your Score: {Math.round(score.percentage)}%</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {score.score} / {score.totalQuestions} correct
              </p>
              <div className="flex gap-3">
                <button
                  onClick={retryQuiz}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-white font-semibold"
                >
                  🔄 Retry Quiz
                </button>
                <button
                  onClick={() => setScore(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded-lg font-semibold"
                >
                  Back to Quizzes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Generate Quiz Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Generate AI Quiz</h2>
              <div className="space-y-3">
                <select
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a note</option>
                  {notes.map(note => <option key={note._id} value={note._id}>{note.title}</option>)}
                </select>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  placeholder="Number of questions"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={generateQuiz} disabled={generating} className="flex-1 bg-purple-600 text-white py-2 rounded">
                  {generating ? 'Generating...' : 'Generate'}
                </button>
                <button onClick={() => setShowGenerateModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quizzes