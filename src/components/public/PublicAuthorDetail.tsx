import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_AUTHOR } from '../../graphql/queries/authors'
import { GET_BOOKS } from '../../graphql/queries/books'
import { getImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import './PublicAuthorDetail.css'

interface Author {
  author_id: number;
  name_author: string;
  biography?: string;
  photo?: string;
}

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author?: {
    name_author: string;
  };
}

const PublicAuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isOpen, showModal, hideModal, message } = useLoginModal()

  const { data: authorData, loading: authorLoading, error: authorError } = useQuery(GET_AUTHOR, {
    variables: { id: parseInt(id || '0') },
    errorPolicy: 'all'
  })
  
  const { data: booksData } = useQuery(GET_BOOKS, {
    variables: { authorId: parseInt(id || '0'), limit: 100 },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    skip: !id
  })
  
  useEffect(() => {
    if (authorData?.author) {
      setAuthor(authorData.author)
      setLoading(false)
    }
    if (authorError) {
      setError('Erro ao carregar autor')
      setLoading(false)
    }
  }, [authorData, authorError])
  
  useEffect(() => {
    if (booksData?.books) {
      setBooks(booksData.books)
    }
  }, [booksData])

  const getBiography = (authorId: number) => {
    const biographies = {
      1: "Guilherme Biondo é um escritor contemporâneo brasileiro conhecido por suas obras que exploram temas profundos da condição humana.",
      2: "Manoel Leite é um renomado autor brasileiro especializado em ficção histórica e romance."
    }
    
    return biographies[authorId as keyof typeof biographies] || 
           author?.biography || 
           'Biografia não disponível no momento.'
  }

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
        <div className="loading">Carregando autor...</div>
      </div>
    )
  }

  if (error || !author) {
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
          <h2>❌ {error || 'Autor não encontrado'}</h2>
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
          <Link to="/public/authors">Autores</Link>
          <span className="separator">›</span>
          <span className="current">{author.name_author}</span>
        </div>
      </div>

      <div className="author-detail-container">
        <div className="author-header">
          <img 
            src={getImageUrl(author.photo, 'author')} 
            alt={author.name_author}
            className="author-photo"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = '/default-author.png';
            }}
          />
          <div className="author-info">
            <h1>{author.name_author}</h1>
            <p className="author-bio">{getBiography(author.author_id)}</p>
          </div>
        </div>

        <div className="author-books">
          <h2>📚 Livros do Autor ({books.length})</h2>
          {books.length === 0 ? (
            <p>Nenhum livro encontrado para este autor.</p>
          ) : (
            <div className="books-grid">
              {books.map(book => (
                <div key={book.book_id} className="book-card" onClick={() => navigate(`/public/books/${book.book_id}`)}>
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
                    <p>{book.description}</p>
                  </div>
                </div>
              ))}
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

export default PublicAuthorDetail
