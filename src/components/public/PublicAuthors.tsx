import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import './PublicAuthors.css'

interface Author {
  author_id: number;
  name_author: string;
  biography?: string;
  photo?: string;
}

const PublicAuthors: React.FC = () => {
  const navigate = useNavigate()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { isOpen, showModal, hideModal, message } = useLoginModal()

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors')
      setAuthors(response.data.authors || response.data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar autores')
      setLoading(false)
    }
  }

  const getBiografia = (author: Author) => {
    const biografias = {
      1: "Guilherme Biondo é um escritor contemporâneo brasileiro conhecido por suas obras que exploram temas profundos da condição humana.",
      2: "Manoel Leite é um renomado autor brasileiro especializado em ficção histórica e romance."
    }
    
    return biografias[author.author_id as keyof typeof biografias] || 
           author.biography || 
           'Biografia não disponível no momento.'
  }

  const filteredAuthors = authors.filter(author =>
    author.name_author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate('/')}>
              <span className="logo">📚</span>
              <h1 className="title">PedBook</h1>
            </div>
            <div className="nav-links">
              <button onClick={() => navigate('/')} className="nav-link">Início</button>
              <button onClick={() => navigate('/public/books')} className="nav-link">Livros</button>
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="loading">Carregando autores...</div>
      </div>
    )
  }

  return (
    <div className="public-layout">
      <div className="public-header">
        <div className="public-nav">
          <div className="brand" onClick={() => navigate('/')}>
            <span className="logo">📚</span>
            <h1 className="title">PedBook</h1>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Início</button>
            <button onClick={() => navigate('/public/books')} className="nav-link">Livros</button>
            <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <section className="content-section">
        <div className="section-header">
          <button onClick={() => navigate('/')} className="back-button">
            ← Voltar ao Início
          </button>
          
          <h2>Todos os Autores ({authors.length})</h2>
          <p>Conheça os escritores do nosso acervo</p>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredAuthors.length === 0 ? (
          <div className="no-results">
            <p>Nenhum autor encontrado para "{searchTerm}"</p>
          </div>
        ) : (
          <div className="authors-grid">
            {filteredAuthors.map(author => (
              <div 
                key={author.author_id} 
                className="author-card clickable"
                onClick={() => navigate(`/public/authors/${author.author_id}`)}
              >
                <div className="author-image-container">
                  <img 
                    src={getImageUrl(author.photo, 'profile')} 
                    alt={author.name_author}
                    className="author-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
                    }}
                  />
                </div>
                <div className="author-info">
                  <h3 className="author-name">{author.name_author}</h3>
                  <p className="author-title">Autor</p>
                  <p className="author-bio">
                    {getBiografia(author).length > 150 ? 
                      getBiografia(author).substring(0, 150) + '...' : 
                      getBiografia(author)
                    }
                  </p>
                  <div className="author-actions">
                    <button className="view-btn">
                      👤 Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="navigation-section">
          <h3>Explorar Mais</h3>
          <div className="navigation-buttons">
            <button 
              onClick={() => navigate('/public/books')} 
              className="nav-btn"
            >
              📚 Ver Todos os Livros
            </button>
            <button 
              onClick={() => showModal('Para alugar livros e acessar todas as funcionalidades, você precisa fazer login.')} 
              className="nav-btn primary"
            >
              🔐 Fazer Login para Alugar Livros
            </button>
          </div>
        </div>
      </section>

      <LoginModal 
        isOpen={isOpen}
        onClose={hideModal}
        message={message}
        title="🔐 Login Necessário"
        actionText="Fazer Login"
      />
    </div>
  )
}

export default PublicAuthors
