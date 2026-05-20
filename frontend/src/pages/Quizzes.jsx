import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ✅ Production API URL
const API_URL = 'https://studybuddyai-1.onrender.com/api'

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No token found')
        setLoading(false)
        return
      }
      
      // ✅ Fixed: Using production API URL
      const response = await axios.get(`${API_URL}/ai/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Fetched quizzes:', response.data)
      setQuizzes(response.data || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = (quiz) => {
    console.log('Starting quiz:', quiz)
    if (!quiz.questions || quiz.questions.length === 0) {
      toast.error('This quiz has no questions')
      return
    }
    setSelectedQuiz(quiz)
    setAnswers({})
    setSubmitted(false)
    setResult(null)
    setCurrentQuestion(0)
  }

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    })
  }

  const submitQuiz = async () => {
    if (!selectedQuiz || !selectedQuiz.questions) {
      toast.error('Quiz data is invalid')
      return
    }
    
    if (Object.keys(answers).length !== selectedQuiz.questions.length) {
      toast.error(`Please answer all ${selectedQuiz.questions.length} questions`)
      return
    }

    try {
      const token = localStorage.getItem('token')
      // ✅ Fixed: Using production API URL
      const response = await axios.post(
        `${API_URL}/ai/quiz/${selectedQuiz._id}/submit`,
        { answers: Object.values(answers), timeTaken: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setResult(response.data)
      setSubmitted(true)
      toast.success(response.data.message)
      fetchQuizzes()
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    }
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setAnswers({})
    setSubmitted(false)
    setResult(null)
    setCurrentQuestion(0)
  }

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
        <Sidebar />
        <div className="ml-64 p-8 flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <Sidebar />
      
      <div className="ml-64 p-8">
        {!selectedQuiz ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">📝 AI Quizzes</h1>
                <p className="text-white/70 mt-2">Test your knowledge with these quizzes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes && quizzes.length > 0 ? (
                quizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 cursor-pointer"
                    onClick={() => startQuiz(quiz)}
                  >
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-xl font-bold text-white mb-2">{quiz.title || 'Untitled Quiz'}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/60 text-sm">
                        📊 {quiz.questions?.length || 0} Questions
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        quiz.difficulty === 'Easy' ? 'bg-green-500/30 text-green-300' :
                        quiz.difficulty === 'Medium' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {quiz.difficulty || 'Medium'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">
                        🎯 Attempts: {quiz.attempts?.length || 0}
                      </span>
                      {quiz.attempts?.length > 0 && (
                        <span className="text-green-400">
                          Best: {Math.max(...quiz.attempts.map(a => Math.round((a.score / a.totalQuestions) * 100)))}%
                        </span>
                      )}
                    </div>
                    <button className="mt-4 w-full py-2 bg-white/20 rounded-lg text-white font-semibold hover:bg-white/30 transition-all">
                      Start Quiz →
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-white/70">No quizzes available</p>
                  <p className="text-white/50 text-sm mt-2">Refresh the page to load sample quizzes</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center"
          >
            <div className="text-7xl mb-4">
              {result && result.percentage >= 70 ? '🎉' : result && result.percentage >= 40 ? '👍' : '📚'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
            <div className="text-5xl font-bold text-white mb-4">
              {result ? Math.round(result.percentage) : 0}%
            </div>
            <p className="text-white/70 text-lg mb-2">
              You scored {result?.score || 0} out of {result?.totalQuestions || 0}
            </p>
            <p className="text-white/50 mb-6">
              {result && result.percentage >= 70 ? 'Excellent! Great job! 🎯' : 
               result && result.percentage >= 40 ? 'Good effort! Keep practicing! 💪' : 
               'Keep learning! Try again to improve! 📖'}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={resetQuiz} className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all">
                Back to Quizzes
              </button>
              <button onClick={() => startQuiz(selectedQuiz)} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Retry Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="mb-6">
              <div className="flex justify-between text-white/70 text-sm mb-2">
                <span>Question {currentQuestion + 1} of {selectedQuiz.questions?.length || 0}</span>
                <span>{Math.round((Object.keys(answers).length / (selectedQuiz.questions?.length || 1)) * 100)}% Complete</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${(Object.keys(answers).length / (selectedQuiz.questions?.length || 1)) * 100}%` }}></div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {selectedQuiz.questions?.[currentQuestion]?.question || 'Loading question...'}
                </h3>
                <div className="space-y-3">
                  {selectedQuiz.questions?.[currentQuestion]?.options?.map((option, idx) => (
                    <label key={idx} className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${answers[currentQuestion] === idx ? 'bg-purple-600/50 border-2 border-purple-400' : 'bg-white/10 hover:bg-white/20'}`}>
                      <input type="radio" name="question" value={idx} checked={answers[currentQuestion] === idx} onChange={() => handleAnswer(currentQuestion, idx)} className="mr-3 w-4 h-4" />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6">
              <button onClick={prevQuestion} disabled={currentQuestion === 0} className="px-6 py-2 bg-white/20 rounded-lg text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-all">
                ← Previous
              </button>
              {currentQuestion === (selectedQuiz.questions?.length || 0) - 1 ? (
                <button onClick={submitQuiz} className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Submit Quiz ✅
                </button>
              ) : (
                <button onClick={nextQuestion} className="px-6 py-2 bg-white/20 rounded-lg text-white font-semibold hover:bg-white/30 transition-all">
                  Next →
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm mb-3">Quick Navigation</p>
              <div className="flex gap-2 flex-wrap">
                {selectedQuiz.questions?.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentQuestion === idx ? 'bg-purple-600 text-white' : answers[idx] !== undefined ? 'bg-green-500/50 text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'}`}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Quizzes