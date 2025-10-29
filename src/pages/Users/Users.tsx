import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getImageUrl } from '../../utils/imageUtils'
import { useAuth } from '../../contexts/AuthContext'
import './Users.css'

interface User {
  user_id: number
  username: string
  role: string
  profile_image?: string
  display_name?: string
  description?: string
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Você precisa estar logado para ver os usuários')
        setLoading(false)
        return
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários')
      }

      const data = await response.json()
      setUsers(data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar usuários')
      setLoading(false)
    }
  }

  const handleViewProfile = (username: string) => {
    navigate(`/profile/${username}`)
  }

  const getDisplayName = (user: User) => {
    if (user.display_name && user.display_name.trim()) {
      return user.display_name
    }
    if (user.username.includes('@')) {
      return user.username.split('@')[0]
    }
    return user.username
  }

  const getUserDescription = (user: User) => {
    if (user.description && user.description.trim()) {
      return user.description
    }
    return user.role === 'admin' ? 'Administrador do sistema' : 'Membro da comunidade'
  }

  if (loading) {
    return (
      <Layout title="Usuários">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Usuários">
        <div className="error-container">
          <div className="error-message">
            <h3>❌ Erro</h3>
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn-retry">
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Usuários">
      <div className="users-page">
        <div className="users-header">
          <h1>👥 Usuários da Biblioteca</h1>
          <p className="users-subtitle">
            Conheça os membros da nossa comunidade ({users.length} usuários)
          </p>
        </div>

        <div className="users-grid">
          {users.map(user => (
            <div key={user.user_id} className={`user-card ${user.role === 'admin' ? 'admin-card' : 'user-card-normal'}`}>
              <div className="user-avatar-container">
                <img 
                  src={getImageUrl(user.profile_image, 'profile')} 
                  alt={getDisplayName(user)}
                  className="user-avatar-large"
                  onClick={() => handleViewProfile(user.username)}
                />
                <div className="user-role-badge">
                  {user.role === 'admin' ? '👑' : '👤'}
                </div>
              </div>

              <div className="user-info">
                <h3 className="user-name" onClick={() => handleViewProfile(user.username)}>
                  {getDisplayName(user)}
                </h3>
                <span className="user-role">
                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </span>
                <p className="user-description">
                  {getUserDescription(user)}
                </p>
              </div>

              <div className="user-actions">
                <button 
                  className="btn-view-profile" 
                  onClick={() => handleViewProfile(user.username)}
                >
                  👁️ Ver Perfil
                </button>
                {currentUser?.role === 'admin' && user.user_id !== currentUser.id && (
                  <span className="admin-indicator">🔧 Admin</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Não há usuários cadastrados no sistema no momento.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Users
