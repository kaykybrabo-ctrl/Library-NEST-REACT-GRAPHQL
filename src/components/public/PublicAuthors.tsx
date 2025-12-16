import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_AUTHORS } from '../../graphql/queries/authors'
import { GET_BOOKS } from '../../graphql/queries/books'
import { getImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import { useAuth } from '../../contexts/AuthContext'
import './PublicAuthors.css'

interface Author {
  author_id: number;
  name_author: string;
  biography?: string;
  photo?: string;
}

const PublicAuthors: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { isOpen, showModal, hideModal, message } = useLoginModal()
  const { isAuthenticated } = useAuth()
  const homePath = isAuthenticated ? '/books' : '/public/authors'
  
  const { data, loading, error } = useQuery(GET_AUTHORS, {
    errorPolicy: 'all'
  })
  
  const { data: booksData } = useQuery(GET_BOOKS, {
    variables: { limit: 100 },
    errorPolicy: 'all'
  })
  
  const authors = data?.authors || []

  const getBiography = (author: Author) => {
    const biographies = {
      1: "Guilherme Biondo é um escritor contemporâneo brasileiro conhecido por suas obras que exploram temas profundos da condição humana. Suas obras abordam questões existenciais e filosóficas com uma linguagem poética e envolvente.",
      2: "Manoel Leite é um renomado autor brasileiro especializado em ficção histórica e romance. Com mais de 20 anos de carreira, já publicou diversos bestsellers que retratam a cultura brasileira."
    }
    
    return biographies[author.author_id as keyof typeof biographies] || 
           author.biography || 
           'Biografia em construção. Este talentoso autor está preparando sua apresentação para você conhecer melhor seu trabalho e trajetória literária.'
  }

  const getAuthorStats = (author: Author) => {
    const authorBooks = booksData?.books?.filter(book => book.author_id === author.author_id) || []
    
    const stats = {
      1: { books: authorBooks.length, rating: 4.8, readers: 2847 },
      2: { books: authorBooks.length, rating: 4.6, readers: 1923 }
    }
    return stats[author.author_id as keyof typeof stats] || { books: authorBooks.length, rating: 4.5, readers: 1200 }
  }

  const filteredAuthors = authors.filter(author =>
    author.name_author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate(homePath)}>
              <span className="logo">📚</span>
              <h1 className="title">PedBook</h1>
            </div>
            <div className="nav-links">
              <Link to="/public/books">Livros</Link>
              <Link to="/public/authors">Autores</Link>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Descobrindo nossos talentosos autores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate('/')}>
              <span className="logo">📚</span>
              <h1 className="title">PedBook</h1>
            </div>
            <div className="nav-links">
              <Link to="/public/books">Livros</Link>
              <Link to="/public/authors">Autores</Link>
            </div>
          </div>
        </div>
        <div className="error-container">
          <div className="error-content">
            <h2>👨‍💼 Autores temporariamente indisponíveis</h2>
            <p>Não conseguimos carregar a lista de autores no momento. Tente novamente em instantes.</p>
            <div className="error-actions">
              <button onClick={() => window.location.reload()} className="btn-primary">
                🔄 Tentar Novamente
              </button>
              <button onClick={() => navigate(homePath)} className="btn-secondary">
                🏠 Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-layout">
      <div className="public-header">
        <div className="public-nav">
          <div className="brand" onClick={() => navigate(homePath)}>
            <span className="logo">📚</span>
            <h1 className="title">PedBook</h1>
          </div>
          <div className="nav-links">
            <Link to="/public/books">Livros</Link>
            <Link to="/public/authors">Autores</Link>
          </div>
        </div>
      </div>

      <div className="breadcrumb-container">
        <div className="breadcrumb">
          <Link to={homePath}>Início</Link>
          <span className="separator">›</span>
          <span className="current">Nossos Autores</span>
        </div>
      </div>

      <div className="authors-wrapper">
        <div className="authors-container">
          <div className="page-title-section">
            <h1 className="page-title">👨‍💼 Nossos Autores</h1>
          </div>

          <div className="authors-controls">
            <div className="search-section">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Buscar por nome do autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-modern"
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <span>⊞</span> Grid
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <span>☰</span> Lista
              </button>
            </div>
          </div>

          {searchTerm && (
            <div className="search-results-info">
              <p>
                {filteredAuthors.length > 0 
                  ? `Encontrados ${filteredAuthors.length} autor(es) para "${searchTerm}"`
                  : `Nenhum autor encontrado para "${searchTerm}"`
                }
              </p>
            </div>
          )}

          {filteredAuthors.length === 0 ? (
            <div className="no-authors">
              <div className="no-authors-icon">👨‍💼</div>
              <h3>Nenhum autor encontrado</h3>
              <p>
                {searchTerm 
                  ? `Não encontramos autores com o termo "${searchTerm}". Tente uma busca diferente.`
                  : 'Nossa biblioteca de autores está sendo preparada. Volte em breve!'
                }
              </p>
              {searchTerm && (
                <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                  🔍 Ver Todos os Autores
                </button>
              )}
            </div>
          ) : (
            <div className={`authors-content ${viewMode}`}>
              {filteredAuthors.map(author => {
                const stats = getAuthorStats(author)
                return (
                  <div 
                    key={author.author_id} 
                    className="author-card-modern"
                    onClick={() => navigate(`/public/authors/${author.author_id}`)}
                  >
                    <div className="author-image-section">
                      <img 
                        src={getImageUrl(author.photo, 'author')} 
                        alt={author.name_author}
                        className="author-photo-modern"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src = '/default-author.png';
                        }}
                      />
                    </div>
                    
                    <div className="author-info-section">
                      <div className="author-category">✍️ Escritor</div>
                      <h3 className="author-name">{author.name_author}</h3>
                      <p className="author-bio-preview">
                        {getBiography(author)}
                      </p>
                      
                      <div className="author-stats-mini">
                        <div className="stat-mini">
                          <span className="stat-icon">📚</span>
                          <span className="stat-text">{stats.books} livros</span>
                        </div>
                      </div>
                      
                      <div className="author-actions">
                        <button 
                          className="btn-view-author"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/public/authors/${author.author_id}`)
                          }}
                        >
                          <span className="btn-icon">👁️</span>
                          <span>Ver Perfil</span>
                        </button>
                        <button 
                          className="btn-author-books"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/public/books?author=${author.author_id}`)
                          }}
                        >
                          <span className="btn-icon">📖</span>
                          <span>Ver Livros</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={isOpen} 
        onClose={hideModal} 
        message={message} 
      />
    </div>
  )
}

export default PublicAuthors
