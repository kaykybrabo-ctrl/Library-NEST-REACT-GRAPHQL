import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { RESET_PASSWORD_MUTATION } from '../graphql/queries/auth'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'
import './ResetPassword.css'

const ResetPassword: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return (params.get('u') || '').trim().toLowerCase()
  }, [searchParams])
  const token = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return (params.get('t') || '').trim()
  }, [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      setError('Digite a nova senha')
      return
    }
    if (newPassword.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const { data } = await resetPasswordMutation({
        variables: {
          newPassword,
          token: token || undefined,
          username: email
        }
      })
      
      
      if (data?.resetPassword) {
        setSuccess('Senha atualizada com sucesso! Fazendo login...')
        
        try {
          const loginSuccess = await login(email, newPassword)
          
          if (loginSuccess) {
            setSuccess('Senha atualizada e login realizado com sucesso!')
            setTimeout(() => {
              navigate('/books')
            }, 1500)
          } else {
            setSuccess('Senha atualizada com sucesso. Você já pode entrar.')
            setTimeout(() => {
              navigate('/login')
            }, 2000)
          }
        } catch (loginError) {
          setSuccess('Senha atualizada com sucesso. Você já pode entrar.')
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      } else {
        setError('Erro ao processar reset de senha')
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir senha')
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
