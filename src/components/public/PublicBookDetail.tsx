import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_BOOK } from '../../graphql/queries/books'
import { GET_BOOK_REVIEWS_PUBLIC } from '../../graphql/queries/reviews'
import { getImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import { useAuth } from '../../contexts/AuthContext'
import './PublicBookDetail.css'

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author_name?: string;
  author?: {
    author_id: number;
    name_author: string;
  };
}

interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
    display_name?: string;
  };
}

const PublicBookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { isOpen, showModal, hideModal, message } = useLoginModal()
  const { isAuthenticated } = useAuth()
  const homePath = isAuthenticated ? '/books' : '/'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUser(payload)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const { data: bookData, loading: bookLoading, error: bookError } = useQuery(GET_BOOK, {
    variables: { id: parseInt(id || '0') },
    errorPolicy: 'all'
  })
  
  const { data: reviewsData } = useQuery(GET_BOOK_REVIEWS_PUBLIC, {
    variables: { bookId: parseInt(id || '0') },
    errorPolicy: 'all',
    skip: !id
  })
  
  useEffect(() => {
    if (bookData?.book) {
      setBook(bookData.book)
      setLoading(false)
    }
    if (bookError) {
      setError('Erro ao carregar livro')
      setLoading(false)
    }
  }, [bookData, bookError])
  
  useEffect(() => {
    if (reviewsData?.bookReviews) {
      setReviews(reviewsData.bookReviews)
    }
  }, [reviewsData])

  const handleRentBook = () => {
    if (!currentUser) {
      showModal('Para alugar este livro, você precisa estar logado no sistema.')
      return
    }
  }

  const handleFavoriteBook = () => {
    if (!currentUser) {
      showModal('Para adicionar este livro aos favoritos, você precisa estar logado no sistema.')
      return
    }
  }

  const handleWriteReview = () => {
    if (!currentUser) {
      showModal('Para escrever uma avaliação, você precisa estar logado no sistema.')
      return
    }
    navigate(`/books/${id}`)
  }

  const getAuthorName = (book: Book) => {
    return book.author?.name_author || book.author_name || 'Autor desconhecido'
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  }

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
          <p>Carregando detalhes do livro...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
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
        <div className="error-container">
          <div className="error-content">
            <h2>📖 Livro não encontrado</h2>
            <p>O livro que você está procurando não existe ou foi removido.</p>
            <div className="error-actions">
              <button onClick={() => navigate('/public/books')} className="btn-primary">
                📚 Ver Todos os Livros
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
          <Link to="/public/books">Livros</Link>
          <span className="separator">›</span>
          <span className="current">{book.title}</span>
        </div>
      </div>

      <div className="book-detail-wrapper">
        <div className="book-detail-container">
          <div className="book-hero">
            <div className="book-image-container">
              <img 
                src={getImageUrl(book.photo, 'book')} 
                alt={book.title}
                className="book-cover-hero"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/default-book.png';
                }}
              />
              <div className="book-rating-badge">
                <div className="rating-stars">{getRatingStars(parseFloat(getAverageRating()))}</div>
                <div className="rating-text">{getAverageRating()}/5</div>
                <div className="rating-count">({reviews.length} avaliações)</div>
              </div>
            </div>
            
            <div className="book-info-hero">
              <div className="book-category">📖 Literatura</div>
              <h1 className="book-title">{book.title}</h1>
              <div className="book-author">
                <span className="author-label">por</span>
                <span 
                  className="author-name"
                  onClick={() => book.author?.author_id && navigate(`/public/authors/${book.author.author_id}`)}
                >
                  {getAuthorName(book)}
                </span>
              </div>
              
              <div className="book-stats">
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-value">{getAverageRating()}</span>
                  <span className="stat-label">Avaliação</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">💬</span>
                  <span className="stat-value">{reviews.length}</span>
                  <span className="stat-label">Reviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-value">Disponível</span>
                  <span className="stat-label">Status</span>
                </div>
              </div>

              <div className="book-actions-hero">
                <button className="btn-rent" onClick={handleRentBook}>
                  <span className="btn-icon">📚</span>
                  <span>Alugar Livro</span>
                </button>
                <button className="btn-favorite" onClick={handleFavoriteBook}>
                  <span className="btn-icon">❤️</span>
                  <span>Favoritar</span>
                </button>
                <button className="btn-review" onClick={handleWriteReview}>
                  <span className="btn-icon">✍️</span>
                  <span>Avaliar</span>
                </button>
              </div>
            </div>
          </div>

          <div className="book-description-section">
            <h2 className="section-title">📝 Sobre este livro</h2>
            <div className="description-content">
              <p className="book-description">
                {book.description || 'Descrição não disponível para este livro.'}
              </p>
            </div>
          </div>

          <div className="reviews-section">
            <div className="reviews-header">
              <h2 className="section-title">💬 Avaliações dos Leitores</h2>
              <button className="btn-write-review" onClick={handleWriteReview}>
                <span className="btn-icon">✍️</span>
                <span>Escrever Avaliação</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon">📝</div>
                <h3>Nenhuma avaliação ainda</h3>
                <p>Seja o primeiro a compartilhar sua opinião sobre este livro!</p>
                <button className="btn-first-review" onClick={handleWriteReview}>
                  ✍️ Escrever Primeira Avaliação
                </button>
              </div>
            ) : (
              <div className="reviews-grid">
                {reviews.map(review => (
                  <div key={review.id} className="review-card-modern">
                    <div className="review-header-modern">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {(review.user.display_name || review.user.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="reviewer-details">
                          <span className="reviewer-name">
                            {review.user.display_name || review.user.username}
                          </span>
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="rating-stars">{getRatingStars(review.rating)}</div>
                        <span className="rating-number">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default PublicBookDetail
