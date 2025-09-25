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
      setError('Link de e-mail inválido ou ausente. Solicite um novo e-mail de redefinição.')
      return
    }
    if (!newPassword || newPassword.length < 3) {
      setError('Por favor, informe uma nova senha com pelo menos 3 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      const payload: any = { newPassword }
      if (token) payload.token = token
      else payload.username = email
      const res = await api.post('/api/reset-password', payload)
      if (res?.data?.ok) {
        setSuccess('Senha atualizada com sucesso. Você já pode entrar.')
        alert('Senha atualizada com sucesso!')
        setTimeout(() => navigate('/'), 1200)
      } else {
        setError(res?.data?.message || 'Falha ao redefinir a senha')
      }
    } catch (e: any) {
      setError('Falha ao redefinir a senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Redefinir Senha">
      <section className="form-section" style={{ maxWidth: 480, margin: '40px auto' }}>
        <h2>Escolha uma nova senha</h2>
        {email ? (
          <p style={{ color: '#555' }}>Redefinindo a senha para: <strong>{email}</strong></p>
        ) : (
          <p style={{ color: '#a00' }}>Nenhum e-mail no link. Volte para o Login e clique novamente em "Esqueceu a senha?".</p>
        )}

        {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
        {success && <div className="success-message" style={{ marginTop: 12 }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <label htmlFor="newPassword">Nova senha:</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />

          <label htmlFor="confirmPassword">Confirmar nova senha:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
          <div style={{ marginTop: 10 }}>
            <Link to="/">Voltar ao Login</Link>
          </div>
        </form>
      </section>
    </Layout>
  )
}

export default ResetPassword
