import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { Rating, Typography, Box } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'
import { Book, Review } from '@/types'
import './BookDetail.css'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userLoan, setUserLoan] = useState<any>(null)
  const { isAdmin } = useAuth()
  const [imgVersion, setImgVersion] = useState(0)

  const buildImageSrc = (path?: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    if (path.startsWith('/')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    return `/api/uploads/${path}${imgVersion ? `?v=${imgVersion}` : ''}`
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP)')
      event.currentTarget.value = ''
      return
    }
    setImageFile(file)
    setError('')
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    if (!file || !id) return
    setUploading(true)
    setUploadStatus('Enviando imagem...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadResp = await api.post(`/api/books/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setBook(prev => {
        if (!prev) return prev
        const respPhoto = uploadResp?.data?.photo
        return { ...prev, photo: respPhoto || prev?.photo || null } as Book
      })
      await fetchBook()
      setImageFile(null)
      setPreviewUrl('')
      setImgVersion(v => v + 1)
      setUploadStatus('Imagem atualizada com sucesso!')
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem'
      setError(msg)
      setUploadStatus(`Erro: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadImageClick = async () => {
    if (!imageFile) return
    await uploadImage(imageFile)
  }

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [id, previewUrl])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/api/user/me')
      setCurrentUser(response.data)
      if (id) {
        checkUserLoan()
      }
    } catch {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          setCurrentUser(userData)
          if (id) {
            checkUserLoan()
          }
        } catch {
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
    }
  }

  const checkUserLoan = async () => {
    try {
      const response = await api.get(`/api/books/${id}/my-loan`)
      if (response.data.hasLoan) {
        const loansResponse = await api.get('/api/loans')
        const currentLoan = loansResponse.data.find((loan: any) => loan.book_id === Number(id))
        setUserLoan(currentLoan)
      } else {
        setUserLoan(null)
      }
    } catch (err) {
      setUserLoan(null)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await api.get(`/api/books/${id}`)
      setBook(prev => {
        const incoming = response.data as Book | null
        if (!incoming) return null
        const photo = incoming.photo ?? prev?.photo ?? null
        return { ...incoming, photo: photo as any }
      })
      setLoading(false)
    } catch (err) {
      setError('Falha ao buscar detalhes do livro')
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/books/${id}/reviews`)
      setReviews(response.data)
    } catch (err) {
      setReviews([])
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !id) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const resp = await api.post(`/api/books/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchBook()
      setImageFile(null)
      setImgVersion(v => v + 1)
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }
  const handleRentBook = async () => {
    try {
      await api.post(`/api/rent/${id}`)
      setError('')
      checkUserLoan()
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Este livro já está alugado')
      } else {
        setError('Erro ao alugar livro. Tente novamente.')
      }
    }
  }

  const handleReturnBook = async () => {
    if (!userLoan) return
    
    if (!confirm('Tem certeza de que deseja devolver este livro?')) {
      return
    }

    try {
      await api.post(`/api/books/${id}/return`)
      setError('')
      setUserLoan(null)
    } catch (err: any) {
      setError('Erro ao devolver livro. Tente novamente.')
    }
  }

  const handleFavoriteBook = async () => {
    if (!currentUser) {
      setError('Faça login para adicionar aos favoritos')
      return
    }

    try {
      const response = await api.post(`/api/favorite/${id}`)
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao adicionar aos favoritos'
      setError(errorMsg)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError('Faça login para enviar uma avaliação')
      return
    }

    try {
      await api.post('/api/reviews', {
        book_id: Number(id),
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      setNewReview({ rating: 5, comment: '' })
      fetchReviews()
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao enviar a avaliação'
      setError(errorMsg)
    }
  }

  if (loading) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="loading">Carregando detalhes do livro...</div>
      </Layout>
    )
  }

  if (!book) {
    return (
      <Layout title="Detalhes do Livro">
        <div className="error-message">Livro não encontrado</div>
        <button onClick={() => navigate('/books')}>Voltar para Livros</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Livro: ${book.title}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section image-tight">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Voltar para Livros
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Autor:</strong> {book.author_name || 'Desconhecido'}</p>
        <p><strong>Descrição:</strong> {book.description || 'Sem descrição disponível'}</p>
        
        {book.categories && book.categories.length > 0 && (
          <p><strong>Gêneros:</strong> {book.categories.join(', ')}</p>
        )}
        
        {book.publishers && book.publishers.length > 0 && (
          <p><strong>Editoras:</strong> {book.publishers.join(', ')}</p>
        )}

        {previewUrl ? (
          <img src={previewUrl} alt="Pré-visualização selecionada" className="book-image" />
        ) : book.photo ? (
          <img
            src={buildImageSrc(book.photo)}
            key={`${book.photo}-${imgVersion}`}
            alt={book.title}
            className="book-image"
            onError={(e) => {
              try {
                const current = e.currentTarget.getAttribute('src') || ''
                const file = (current.split('?')[0].split('/').pop() || '').trim()
                if (file) {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = `/api/uploads/${file}`
                  return
                }
              } catch {}
              e.currentTarget.onerror = null
              e.currentTarget.src = '/api/uploads/default-user.png'
            }}
          />
        ) : null}
        
        {!previewUrl && !book.photo && (
          <div className="image-placeholder">Nenhuma imagem definida ainda. Selecione um arquivo abaixo para enviar.</div>
        )}

        
        {!book.photo && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Nenhuma imagem definida para este livro ainda.
          </div>
        )}

        {isAdmin && (
          <div className="image-upload">
            <h3>Atualizar Imagem do Livro</h3>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectImage}
                disabled={uploading}
              />
              {imageFile && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Selecionado: {imageFile.name}</div>
              )}
              <button onClick={handleUploadImageClick} disabled={!imageFile || uploading}>
                {uploading ? 'Enviando...' : 'Atualizar Imagem'}
              </button>
            </div>
          </div>
        )}
        {uploadStatus && (
          <div style={{ marginTop: 8, fontSize: 12, color: uploadStatus.startsWith('Erro') ? '#c00' : '#0a0' }}>
            {uploadStatus}
          </div>
        )}
      </section>

      <section className="form-section">
        <h3>Ações do Livro</h3>
        {userLoan ? (
          <div className="loan-info">
            <div className="loan-status">
              <h4>📚 Você tem este livro alugado</h4>
              <div className="loan-details">
                <p><strong>Alugado em:</strong> {new Date(userLoan.loan_date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Vencimento:</strong> {new Date(userLoan.due_date).toLocaleDateString('pt-BR')}</p>
                <div className={`days-remaining ${userLoan.is_overdue ? 'overdue' : userLoan.days_remaining <= 1 ? 'urgent' : userLoan.days_remaining <= 3 ? 'warning' : 'normal'}`}>
                  {userLoan.is_overdue 
                    ? `⚠️ Atrasado há ${Math.abs(userLoan.days_remaining)} dias`
                    : userLoan.days_remaining === 0 
                      ? '⏰ Vence hoje!'
                      : userLoan.days_remaining === 1
                        ? '⏰ Vence amanhã'
                        : `📅 ${userLoan.days_remaining} dias restantes`
                  }
                </div>
                {userLoan.is_overdue && (
                  <div className="fine-amount">
                    <strong>💰 Multa: R$ {userLoan.fine_amount.toFixed(2)}</strong>
                  </div>
                )}
              </div>
            </div>
            <div className="book-actions">
              <button onClick={handleReturnBook} className="return-button">Devolver Livro</button>
              <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>
            </div>
          </div>
        ) : (
          <div className="book-actions">
            <button onClick={handleRentBook}>Alugar Livro</button>
            <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>
          </div>
        )}
      </section>

      <section className="form-section">
        <h3>Escreva uma Avaliação</h3>
        {!currentUser ? (
          <p>Faça login para escrever uma avaliação.</p>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend" sx={{ mb: 1 }}>Nota:</Typography>
              <Rating
                name="book-rating"
                value={newReview.rating}
                onChange={(_, newValue) => {
                  setNewReview({ ...newReview, rating: newValue || 1 })
                }}
                max={5}
                size="large"
              />
            </Box>

            <label htmlFor="comment">Comentário:</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="review-textarea"
            />

            <button type="submit">Enviar Avaliação</button>
          </form>
        )}
      </section>

      <section className="form-section">
        <h3>Avaliações</h3>
        {reviews.length === 0 ? (
          <p>Sem avaliações ainda.</p>
        ) : (
          <div>
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.user?.username || 'Usuário'}</strong>
                  <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small className="review-date">
                  {new Date(review.created_at).toLocaleDateString('pt-BR')}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default BookDetail
