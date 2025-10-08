import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { logout, isAdmin } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header>
        <h1>{title}</h1>
        <button id="logout-button" onClick={handleLogout} aria-label="Sair da conta">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path fill="currentColor" d="M10 3a1 1 0 0 1 1 1v4h-2V5H6v14h3v-3h2v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5Zm6.293 6.293 1.414 1.414L15.414 13H21v2h-5.586l2.293 2.293-1.414 1.414L12 14l4.293-4.293Z" />
          </svg>
          <span>Sair</span>
        </button>
      </header>

      <nav>
        <Link 
          to="/books" 
          className={location.pathname === '/books' ? 'active' : ''}
        >
          Livros
        </Link>
        <Link 
          to="/authors" 
          className={location.pathname === '/authors' ? 'active' : ''}
        >
          Autores
        </Link>
        <Link 
          to="/my-loans" 
          className={location.pathname === '/my-loans' ? 'active' : ''}
        >
          Meus Empréstimos
        </Link>
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
        >
          Perfil
        </Link>
        {isAdmin && (
          <Link 
            to="/loans" 
            className={location.pathname === '/loans' ? 'active' : ''}
          >
            Gerenciar Empréstimos
          </Link>
        )}
      </nav>

      <main>{children}</main>

      <footer>
        <p>&copy; 2025 PedBook</p>
      </footer>
    </>
  )
}

export default Layout
