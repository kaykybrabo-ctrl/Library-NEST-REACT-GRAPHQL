import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { useAuth } from '../contexts/AuthContext'
import { FORGOT_PASSWORD_MUTATION } from '../graphql/queries/auth'
import './Login.css'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD_MUTATION)

  const handleForgotPassword = async () => {
    if (!username.trim()) {
      setError('Digite seu e-mail para recuperar a senha')
      return
    }
    
    setPreview(null)
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const { data } = await forgotPasswordMutation({
        variables: { username: username.trim() }
      })
      
      if (data?.forgotPassword) {
        const message = data.forgotPassword;
        
        // Extrair o link do Ethereal se existir
        const previewMatch = message.match(/Preview: (https?:\/\/[^\s]+)/);
        if (previewMatch) {
          setSuccess('E-mail de recuperação enviado com sucesso!');
          setPreview(previewMatch[1]);
        } else {
          setSuccess(message);
        }
      } else {
        setError('Erro ao processar solicitação de recuperação')
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar e-mail de recuperação')
      setSuccess('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>PedBook</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
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
