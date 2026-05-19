import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const API = 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/user/profile`)
      console.log('Fetched user:', response.data)
      setUser(response.data)
    } catch (error) {
      console.error('Fetch user error:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Login request to:', `${API}/auth/login`)
      const response = await axios.post(`${API}/auth/login`, { email, password })
      console.log('Login response:', response.data)
      
      const { token, user } = response.data
      
      // Save token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update state
      setToken(token)
      setUser(user)
      
      toast.success('Welcome back! 🎉')
      return true
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const signup = async (name, email, password) => {
    try {
      console.log('Signup request to:', `${API}/auth/signup`)
      const response = await axios.post(`${API}/auth/signup`, { name, email, password })
      console.log('Signup response:', response.data)
      
      const { token, user } = response.data
      
      // Save token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update state
      setToken(token)
      setUser(user)
      
      toast.success('Account created! 🚀')
      return true
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Signup failed')
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
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}