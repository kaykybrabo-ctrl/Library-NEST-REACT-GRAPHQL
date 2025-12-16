import React, { useState, useEffect, ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { useAuth } from '../contexts/AuthContext'
import { ME_QUERY } from '../graphql/queries/auth'
import { getImageUrl } from '../utils/imageUtils'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  title: string
}

interface UserProfile {
  profile_image?: string
  username: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, user, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const effectiveHomePath = (isAuthenticated || localStorage.getItem('token')) ? '/books' : '/'

  const { data: profileData } = useQuery(ME_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network'
  })
  
  useEffect(() => {
    if (profileData?.me) {
      setUserProfile(profileData.me)
    }
  }, [profileData])

  const handleLogout = () => {
    logout()
    window.location.replace('/')
  }

  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <header>
          <h1 
            onClick={() => {
              window.location.reload()
            }}
            className="clickable-header"
            title="Recarregar esta página"
          >
            📚 PedBook
          </h1>
          <div className="header-user-menu">
            {isAuthenticated ? (
              <div className="user-menu">
                <img
                  src={getImageUrl(userProfile?.profile_image, 'profile')}
                  alt="Perfil"
                  className="user-avatar"
                  onClick={() => setShowDropdown(!showDropdown)}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/default-profile.png';
                  }}
                />
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>👤</span>
                      <span>Ir ao Perfil</span>
                    </Link>
                    <Link 
                      to="/books" 
                      className="dropdown-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>📚</span>
                      <span>Livros</span>
                    </Link>
                    <Link 
                      to="/authors" 
                      className="dropdown-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>👨‍💼</span>
                      <span>Autores</span>
                    </Link>
                    <Link 
                      to="/users" 
                      className="dropdown-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>👥</span>
                      <span>Usuários</span>
                    </Link>
                    <Link 
                      to={isAdmin ? "/loans" : "/my-loans"} 
                      className="dropdown-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>📋</span>
                      <span>{isAdmin ? "Gerenciar Empréstimos" : "Meus Empréstimos"}</span>
                    </Link>
                    <button 
                      className="dropdown-link logout-button"
                      onClick={handleLogout}
                    >
                      <span>🚪</span>
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                Entrar
              </Link>
            )}
          </div>
        </header>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
