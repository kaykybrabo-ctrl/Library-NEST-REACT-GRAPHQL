import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import './Login.css'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate('/books')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!username.trim()) {
      setError('Please enter your email to receive the reset link')
      return
    }
    setError('')
    setPreview(null)
    setLoading(true)
    try {
      const res = await api.post('/api/forgot-password', { username: username.trim() })
      const data = res?.data || {}
      if (data.preview) {
        setPreview(data.preview)
      }
      try { alert('If the account exists, a reset email has been sent.') } catch {}
    } catch (e) {
      try { alert('If the account exists, a reset email has been sent.') } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>Library System</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          placeholder="you@example.com"
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" className="link-button" onClick={handleForgotPassword} disabled={loading} style={{ marginTop: 10 }}>
          Forgot password?
        </button>
        {preview && (
          <div style={{ marginTop: 12 }}>
            <div>Preview your reset email (Ethereal):</div>
            <a href={preview} target="_blank" rel="noopener noreferrer">{preview}</a>
          </div>
        )}
      </form>

      <p className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  )
}

export default Login
