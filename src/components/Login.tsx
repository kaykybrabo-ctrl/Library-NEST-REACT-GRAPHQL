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
        setError('E-mail ou senha inválidos')
      }
    } catch (err) {
      setError('Falha no login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!username.trim()) {
      setError('Informe seu e-mail para receber o link de redefinição')
      return
    }
    setError('')
    setPreview(null)
    setLoading(true)
    try {
      console.log('🔄 Enviando requisição de esqueceu senha para:', username.trim())
      const res = await api.post('/api/forgot-password', { username: username.trim() })
      const data = res?.data || {}
      console.log('📥 Resposta recebida do backend:', data)
      
      if (data.preview) {
        console.log('✅ Preview URL encontrado:', data.preview)
        setPreview(data.preview)
      } else {
        console.log('⚠️ Preview não encontrado na resposta')
      }
      
      if (data.error) {
        console.error('❌ Erro retornado do backend:', data.error)
        setError('Erro ao enviar email: ' + data.error)
      } else {
        alert('Se a conta existir, um e-mail de redefinição foi enviado.')
      }
    } catch (e) {
      console.error('❌ Erro na requisição:', e)
      alert('Se a conta existir, um e-mail de redefinição foi enviado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>PedBook</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail:</label>
        <input
          type="email"
          id="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          placeholder="voce@exemplo.com"
        />

        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" className="link-button" onClick={handleForgotPassword} disabled={loading} style={{ marginTop: 10 }}>
          Esqueceu a senha?
        </button>
        {preview && (
          <div className="email-preview">
            <div className="email-preview-title">Visualize seu e-mail de redefinição (Ethereal):</div>
            <a className="email-preview-link" href={preview} target="_blank" rel="noopener noreferrer">
              {preview}
            </a>
          </div>
        )}
      </form>

      <p className="auth-link">
        Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
      </p>
    </div>
  )
}

export default Login
