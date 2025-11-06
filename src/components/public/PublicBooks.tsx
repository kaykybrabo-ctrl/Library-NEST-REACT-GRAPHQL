import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_BOOKS } from '../../graphql/queries/books'
import { getImageUrl } from '../../utils/imageUtils'
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
  const [searchTerm, setSearchTerm] = useState('')
  const { isOpen, showModal, hideModal, message } = useLoginModal()
  
  const { data, loading, error } = useQuery(GET_BOOKS, {
    variables: { limit: 1000 },
    errorPolicy: 'all'
  })
  
  const books = data?.books || []

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
              <h1 className="title">PedBook</h1>
            </div>
            <div className="nav-links">
              <Link to="/public/books">Livros</Link>
              <Link to="/public/authors">Autores</Link>
            </div>
          </div>
        </div>
        <div className="loading">Carregando livros...</div>
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
        <div className="error">
          <h2>❌ {error?.message || 'Erro ao carregar livros'}</h2>
          <button onClick={() => navigate('/')}>🏠 Voltar ao Início</button>
        </div>
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
            <Link to="/public/books">Livros</Link>
            <Link to="/public/authors">Autores</Link>
          </div>
        </div>
      </div>

      <div className="breadcrumb-container">
        <div className="breadcrumb">
          <Link to="/">Início</Link>
          <span className="separator">›</span>
          <span className="current">Livros</span>
        </div>
      </div>

      <div className="books-container">
        <div className="books-header">
          <h1>📚 Nossa Biblioteca</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar livros ou autores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <p>Nenhum livro encontrado para "{searchTerm}"</p>
          ) : (
            filteredBooks.map(book => (
              <div 
                key={book.book_id} 
                className="book-card"
                onClick={() => navigate(`/public/books/${book.book_id}`)}
              >
                <img 
                  src={getImageUrl(book.photo, 'book')} 
                  alt={book.title}
                  className="book-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/default-book.png';
                  }}
                />
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">por {getAuthorName(book)}</p>
                  <p className="book-description">{book.description}</p>
                </div>
              </div>
            ))
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

export default PublicBooks
