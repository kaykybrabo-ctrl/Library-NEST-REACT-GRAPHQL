import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils'
import LoginModal from '../LoginModal'
import { useLoginModal } from '../../hooks/useLoginModal'
import './PublicBookDetail.css'

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author_id: number;
  author_name?: string;
  author?: {
    name_author: string;
  };
}

interface Review {
  review_id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
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

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
    }
  }, [id])

  const checkAuthStatus = async () => {
    try {
      // Verificar se há token no localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setCurrentUser(null)
        return
      }
      
      const response = await axios.get('/api/get-profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCurrentUser(response.data)
    } catch {
      setCurrentUser(null)
      // Limpar token inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`)
      setBook(response.data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar detalhes do livro')
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews')
      const bookReviews = response.data.filter((review: Review) => 
        review.book_id === Number(id)
      )
      setReviews(bookReviews)
    } catch (err) {
      // Silently handle error for public viewing
    }
  }
  const handleRentBook = () => {
    if (!currentUser) {
      showModal('Para alugar este livro, você precisa estar logado no sistema.')
      return
    }
    // Lógica para usuários logados (se necessário)
  }

  const handleFavoriteBook = () => {
    if (!currentUser) {
      showModal('Para adicionar este livro aos favoritos, você precisa estar logado no sistema.')
      return
    }
    // Lógica para usuários logados (se necessário)
  }

  const handleWriteReview = () => {
    if (!currentUser) {
      showModal('Para escrever uma avaliação, você precisa estar logado no sistema.')
      return
    }
    // Redirect to authenticated book detail for actions
    navigate(`/books/${id}`)
  }

  const getAuthorName = (book: Book) => {
    if (book.author?.name_author) return book.author.name_author;
    if (book.author_name) return book.author_name;
    return 'Autor desconhecido';
  }

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
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="loading">Carregando detalhes do livro...</div>
      </div>
    )
  }

  if (!book) {
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
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="error-message">Livro não encontrado</div>
        <button onClick={() => navigate('/')}>Voltar ao Início</button>
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
            <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/')} className="back-button">
          ← Voltar ao Início
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Autor:</strong> 
          <span 
            className="author-link" 
            onClick={() => navigate(`/public/authors/${book.author_id}`)}
          >
            {getAuthorName(book)}
          </span>
        </p>
        <p><strong>Descrição:</strong> {book.description || 'Nenhuma descrição disponível'}</p>
        
        <div className="book-image-container">
          <img 
            src={getImageUrl(book.photo, 'book')} 
            alt={book.title}
            className="book-image-enhanced"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
            }}
          />
        </div>
      </section>

      <section className="form-section">
        <h3>Ações do Livro</h3>
        <div className="book-actions">
          {currentUser?.role !== 'admin' && (
            <button onClick={handleRentBook} className="action-btn primary">
              📚 Alugar Livro
            </button>
          )}
          <button onClick={handleFavoriteBook} className="action-btn secondary">
            ⭐ Adicionar aos Favoritos
          </button>
        </div>
        {!currentUser && (
          <p className="login-prompt">
            <small>Faça login para {currentUser?.role !== 'admin' ? 'alugar livros e ' : ''}adicionar aos favoritos</small>
          </p>
        )}
        {currentUser?.role === 'admin' && (
          <p className="admin-notice">
            <small>👨‍💼 Como administrador, você não pode alugar livros</small>
          </p>
        )}
      </section>

      <section className="form-section">
        <h3>Escrever uma Avaliação</h3>
        {!currentUser ? (
          <div className="login-prompt-section">
            <p>Faça login para escrever uma avaliação.</p>
            <button onClick={() => navigate('/login')} className="login-btn">Fazer Login</button>
          </div>
        ) : (
          <div className="authenticated-action">
            <p>Você está logado! Clique abaixo para escrever uma avaliação:</p>
            <button onClick={handleWriteReview} className="action-btn primary">
              ✍️ Escrever Avaliação
            </button>
          </div>
        )}
      </section>

      <section className="form-section">
        <h3>Avaliações ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar este livro!</p>
        ) : (
          <div className="reviews-container">
            {reviews.map(review => (
              <div key={review.review_id} className="review-card">
                <div className="review-header">
                  <div className="review-user-info">
                    <strong className="review-username">
                      👤 {review.username || 'Usuário'}
                    </strong>
                    <span className="review-stars">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <small className="review-date">
                    {review.created_at ? 
                      new Date(review.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : 
                      'Data não disponível'
                    }
                  </small>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
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

export default PublicBookDetail
