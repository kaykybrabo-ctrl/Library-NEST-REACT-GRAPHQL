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
    } catch {
      setCurrentUser(null)
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
      const response = await api.get('/api/reviews')
      const bookReviews = response.data.filter((review: Review) => 
        review.book_id === Number(id)
      )
      setReviews(bookReviews)
    } catch (err) {
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
      alert('Imagem do livro atualizada com sucesso!')
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem'
      setError(msg)
      alert(`Erro: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRentBook = async () => {
    try {
      await api.post(`/api/rent/${id}`)
      alert('Livro alugado com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao alugar o livro. Você pode não estar logado ou o livro já está alugado.'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
    }
  }

  const handleFavoriteBook = async () => {
    try {
      await api.post(`/api/favorite/${id}`)
      alert('Livro adicionado aos favoritos!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao adicionar o livro aos favoritos'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
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
        user_id: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment
      })
      
      setNewReview({ rating: 5, comment: '' })
      fetchReviews()
      alert('Avaliação enviada com sucesso!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Falha ao enviar a avaliação'
      setError(errorMsg)
      alert(`Erro: ${errorMsg}`)
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
        <div className="book-actions">
          <button onClick={handleRentBook}>Alugar Livro</button>
          <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>
        </div>
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
              <div key={review.review_id} className="review-card">
                <div className="review-header">
                  <strong>{review.username}</strong>
                  <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small className="review-date">
                  {new Date(review.review_date).toLocaleDateString('pt-BR')}
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
