import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  console.log('PrivateRoute - user:', user, 'loading:', loading)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  // Agar user nahi hai toh login pe bhejo
  if (!user) {
    console.log('No user, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  // User hai toh children (dashboard) dikhao
  console.log('User found, showing protected content')
  return children
}

export default PrivateRoute