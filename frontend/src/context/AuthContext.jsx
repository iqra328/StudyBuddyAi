import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const API = 'https://studybuddyai-1.onrender.com/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token && !user) {  // ✅ Only fetch user if no user already
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else if (!token) {
      setLoading(false)
    }
  }, [token]) // ✅ Remove user from dependency array

 const fetchUser = async () => {
  try {
    const response = await axios.get(`${API}/user/profile`)
    console.log('Fetched user:', response.data)
    setUser(response.data)
  } catch (error) {
    console.error('Fetch user error:', error.response?.status)
    setUser(null)      // ✅ sirf user null karo, token mat hatao
  } finally {
    setLoading(false)
  }
}

  const login = async (email, password) => {
    setLoading(true)  // ✅ Set loading true
    try {
      console.log('Login request to:', `${API}/auth/login`)
      const response = await axios.post(`${API}/auth/login`, { email, password })
      console.log('Login response:', response.data)
      
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setUser(userData)         // ✅ Set user directly from login
      setLoading(false)         // ✅ Stop loading
      
      toast.success('Welcome back! 🎉')
      return true
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Login failed')
      setLoading(false)
      return false
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      console.log('Signup request to:', `${API}/auth/signup`)
      const response = await axios.post(`${API}/auth/signup`, { name, email, password })
      console.log('Signup response:', response.data)
      
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setToken(newToken)
      setUser(userData)
      setLoading(false)
      
      toast.success('Account created! 🚀')
      return true
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Signup failed')
      setLoading(false)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}