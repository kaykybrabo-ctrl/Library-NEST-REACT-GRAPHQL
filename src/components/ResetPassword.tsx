import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from './Layout'

const ResetPassword: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('u') || '').trim().toLowerCase()
  }, [location.search])
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('t') || '').trim()
  }, [location.search])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Invalid or missing email link. Please request a new reset email.')
      return
    }
    if (!newPassword || newPassword.length < 3) {
      setError('Please enter a new password with at least 3 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const payload: any = { newPassword }
      if (token) payload.token = token
      else payload.username = email
      const res = await api.post('/api/reset-password', payload)
      if (res?.data?.ok) {
        setSuccess('Password updated successfully. You can now log in.')
        alert('Password updated successfully!')
        setTimeout(() => navigate('/'), 1200)
      } else {
        setError(res?.data?.message || 'Failed to reset password')
      }
    } catch (e: any) {
      setError('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Reset Password">
      <section className="form-section" style={{ maxWidth: 480, margin: '40px auto' }}>
        <h2>Choose a new password</h2>
        {email ? (
          <p style={{ color: '#555' }}>Resetting password for: <strong>{email}</strong></p>
        ) : (
          <p style={{ color: '#a00' }}>No email in link. Please go back to Login and click "Forgot password?" again.</p>
        )}

        {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
        {success && <div className="success-message" style={{ marginTop: 12 }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <label htmlFor="newPassword">New password:</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="confirmPassword">Confirm new password:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
          <div style={{ marginTop: 10 }}>
            <Link to="/">Back to Login</Link>
          </div>
        </form>
      </section>
    </Layout>
  )
}

export default ResetPassword
