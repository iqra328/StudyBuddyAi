import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

const API_URL = 'https://studybuddyai-1.onrender.com/api'

const GoogleAuth = ({ mode = 'login' }) => {
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google credential:', credentialResponse)
    
    try {
      // Send the credential to backend
      const response = await axios.post(`${API_URL}/auth/google`, {
        credential: credentialResponse.credential
      })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success(`${mode === 'login' ? 'Logged in' : 'Signed up'} with Google! 🎉`)
      navigate('/')
    } catch (error) {
      console.error('Google auth error:', error)
      toast.error('Google authentication failed')
    }
  }

  const handleGoogleError = () => {
    console.error('Google Login Failed')
    toast.error('Google login failed. Please try again.')
  }

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      useOneTap={mode === 'login'}
      text={mode === 'login' ? 'continue_with' : 'signup_with'}
      shape="circle"
      width="250"
    />
  )
}

export default GoogleAuth