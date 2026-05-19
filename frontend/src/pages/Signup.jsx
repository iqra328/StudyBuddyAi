import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import '../css/login.css'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { signup } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    const success = await signup(name, email, password)
    setLoading(false)
    if (success) navigate('/')
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const passwordStrength = getPasswordStrength()
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669']

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join EduMate AI and start learning smarter</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">👤</span> Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              className={`login-input ${errors.name ? 'error' : ''}`}
              autoComplete="name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          {/* Email Field */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">📧</span> Email Address
            </label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              className={`login-input ${errors.email ? 'error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          {/* Password Field */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">🔒</span> Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              className={`login-input ${errors.password ? 'error' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`strength-bar ${level <= passwordStrength ? 'active' : ''}`}
                    style={{ backgroundColor: level <= passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb' }}
                  />
                ))}
              </div>
              <div className="strength-text" style={{ color: strengthColors[passwordStrength - 1] }}>
                Password Strength: {strengthLabels[passwordStrength - 1]}
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
          )}
          
          {/* Confirm Password Field */}
          <div className="input-group">
            <label className="input-label">
              <span className="label-icon">✅</span> Confirm Password
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
              }}
              className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          {/* Terms Agreement */}
          <div className="terms-agreement">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
            </label>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account 🚀'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        {/* Social Signup */}
        <div className="social-login">
          <button className="social-btn">
            <span className="social-icon">G</span> Google
          </button>
          <button className="social-btn">
            <span className="social-icon">f</span> Facebook
          </button>
          <button className="social-btn">
            <span className="social-icon">🐙</span> GitHub
          </button>
        </div>
        
        {/* Login Link */}
        <div className="signup-link">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup