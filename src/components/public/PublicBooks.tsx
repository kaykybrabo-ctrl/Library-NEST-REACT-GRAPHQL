import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import './PublicBooks.css'

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author_id: number;
  author?: {
    name_author: string;
  };
}

const PublicBooks: React.FC = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { isOpen, showModal, hideModal, message } = useLoginModal()

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/api/books?limit=1000')
      setBooks(response.data.books || response.data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar livros')
      setLoading(false)
    }
  }

  const getAuthorName = (book: Book) => {
    if (book.author?.name_author) return book.author.name_author;
    return 'Autor desconhecido';
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAuthorName(book).toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate('/')}>
              <span className="logo">📚</span>
              <h1 className="title">Library NEST</h1>
            </div>
            <div className="nav-links">
              <button onClick={() => navigate('/')} className="nav-link">Início</button>
              <button onClick={() => navigate('/public/authors')} className="nav-link">Autores</button>
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="loading">Carregando livros...</div>
      </div>
    )
  }

  return (
    <div className="public-layout">
      <div className="public-header">
        <div className="public-nav">
          <div className="brand" onClick={() => navigate('/')}>
            <span className="logo">📚</span>
            <h1 className="title">Library NEST</h1>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Início</button>
            <button onClick={() => navigate('/public/authors')} className="nav-link">Autores</button>
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
          
          <h2>Todos os Livros ({books.length})</h2>
          <p>Explore nosso acervo completo de livros</p>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="no-results">
            <p>Nenhum livro encontrado para "{searchTerm}"</p>
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.map(book => (
              <div 
                key={book.book_id} 
                className="book-card clickable"
                onClick={() => navigate(`/public/books/${book.book_id}`)}
              >
                <div className="book-image-container">
                  <img 
                    src={getImageUrl(book.photo, 'book')} 
                    alt={book.title}
                    className="book-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                    }}
                  />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p 
                    className="book-author clickable-author"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/public/authors/${book.author_id}`);
                    }}
                  >
                    👤 {getAuthorName(book)}
                  </p>
                  <p className="book-description">
                    {book.description ? 
                      (book.description.length > 120 ? 
                        book.description.substring(0, 120) + '...' : 
                        book.description
                      ) : 
                      'Descrição não disponível'
                    }
                  </p>
                  <div className="book-actions">
                    <button className="view-btn">
                      📖 Ver Detalhes
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
              onClick={() => navigate('/public/authors')} 
              className="nav-btn"
            >
              👥 Ver Todos os Autores
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

export default PublicBooks
