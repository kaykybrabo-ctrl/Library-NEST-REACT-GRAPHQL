import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_BOOK, UPLOAD_BOOK_IMAGE } from '@/graphql/queries/books'
import { RENT_BOOK_MUTATION, MY_BOOK_LOAN_QUERY, BOOK_LOAN_STATUS_QUERY } from '@/graphql/queries/loans'
import { CREATE_REVIEW_MUTATION, BOOK_REVIEWS_QUERY } from '@/graphql/queries/reviews'
import { ADD_TO_FAVORITES_MUTATION } from '@/graphql/queries/favorites'
import { ME_QUERY } from '@/graphql/queries/auth'
import Layout from '@/components/Layout'
import ErrorModal from '@/components/ErrorModal'
import SuccessModal from '@/components/SuccessModal'
import ConfirmModal from '@/components/ConfirmModal'
import { Rating, Typography, Box } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'
import { Book, Review } from '@/types'
import api from '@/api'
import './BookDetail.css'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const { isAdmin } = useAuth()
  const [imgVersion, setImgVersion] = useState(0)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successModalMessage, setSuccessModalMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { data: bookData, loading, refetch: refetchBook } = useQuery(GET_BOOK, {
    variables: { id: Number(id) },
    skip: !id,
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery(BOOK_REVIEWS_QUERY, {
    variables: { bookId: Number(id) },
    skip: !id,
  })

  const { data: currentUserData } = useQuery(ME_QUERY)

  const { data: userLoanData, refetch: refetchUserLoan } = useQuery(MY_BOOK_LOAN_QUERY, {
    variables: { bookId: Number(id) },
    skip: !id || !currentUserData?.me,
  })

  const { data: bookLoanStatusData } = useQuery(BOOK_LOAN_STATUS_QUERY, {
    variables: { bookId: Number(id) },
    skip: !id,
  })

  const [rentBook] = useMutation(RENT_BOOK_MUTATION)
  const [createReview] = useMutation(CREATE_REVIEW_MUTATION)
  const [addToFavorites] = useMutation(ADD_TO_FAVORITES_MUTATION)
  const [uploadBookImage] = useMutation(UPLOAD_BOOK_IMAGE)

  const book = bookData?.book
  const reviews = reviewsData?.bookReviews || []
  const currentUser = currentUserData?.me
  const userLoan = userLoanData?.myBookLoan?.loan
  const bookLoanStatus = bookLoanStatusData?.bookLoanStatus
  const isBookRentedByOther = bookLoanStatus?.isRented && !userLoan

  const buildImageSrc = (path?: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    if (path.startsWith('/')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    return `/api/uploads/${path}${imgVersion ? `?v=${imgVersion}` : ''}`
  }

  const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setUploadStatus('Enviando imagem...')
    
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      await uploadBookImage({
        variables: {
          bookId: Number(id),
          filename: file.name,
          fileData: fileData
        }
      })
      
      refetchBook()
      setImageFile(null)
      setPreviewUrl('')
      setImgVersion(v => v + 1)
      setUploadStatus('Imagem atualizada com sucesso!')
      setError('')
    } catch (err: any) {
      const msg = err?.message || 'Falha ao enviar a imagem'
      setError(msg)
      setUploadStatus('')
    } finally {
      setUploading(false)
    }
  }
  const handleUploadImageClick = async () => {
    if (!imageFile) return
    await uploadImage(imageFile)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile || !id) return

    await uploadImage(imageFile)
  }
  const handleRentBook = () => {
    setShowConfirmModal(true)
  }

  const confirmRentBook = async () => {
    setShowConfirmModal(false)
    try {
      await rentBook({
        variables: { bookId: Number(id) }
      })
      setError('')
      refetchUserLoan()
    } catch (err: any) {
      let errorMessage = 'Erro ao alugar livro. Tente novamente.'
      
      if (err.message?.includes('já está emprestado')) {
        errorMessage = 'Este livro já está emprestado para outro usuário.'
      } else if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        errorMessage = err.graphQLErrors[0].message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setErrorModalMessage(errorMessage)
      setShowErrorModal(true)
      setError('')
    }
  }

  const handleReturnBook = async () => {
    if (!userLoan) return
    
    if (!confirm('Tem certeza de que deseja devolver este livro?')) {
      return
    }

    setError('Devolução de livro ainda não implementada via GraphQL')
  }

  const handleFavoriteBook = async () => {
    if (!currentUser) {
      setError('Faça login para adicionar aos favoritos')
      return
    }

    try {
      await addToFavorites({
        variables: { bookId: Number(id) }
      })
      setError('')
      setSuccessModalMessage(`"${book?.title}" foi adicionado aos seus favoritos!`)
      setShowSuccessModal(true)
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao adicionar aos favoritos'
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
      await createReview({
        variables: {
          bookId: Number(id),
          rating: newReview.rating,
          comment: newReview.comment
        }
      })
      
      setNewReview({ rating: 5, comment: '' })
      refetchReviews()
      setError('')
    } catch (err: any) {
      const errorMsg = err.message || 'Falha ao enviar a avaliação'
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
        <p><strong>Autor:</strong> {book.author?.name_author || 'Desconhecido'}</p>
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
        
        {isAdmin && !previewUrl && !book.photo && (
          <div className="image-placeholder">Nenhuma imagem definida ainda. Selecione um arquivo abaixo para enviar.</div>
        )}

        
        {isAdmin && !book.photo && (
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
        ) : isBookRentedByOther ? (
          <div className="book-actions">
            <button 
              disabled 
              className="rented"
              title={`❌ Livro alugado por outro usuário`}
            >
              Livro Indisponível
            </button>
            <button onClick={handleFavoriteBook}>Adicionar aos Favoritos</button>
          </div>
        ) : (
          <div className="book-actions">
            <button onClick={handleRentBook} title="✅ Clique para alugar este livro">Alugar Livro</button>
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

      <ErrorModal
        isOpen={showErrorModal}
        title="Erro ao Alugar Livro"
        message={errorModalMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        title="Livro Favoritado!"
        message={successModalMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar Aluguel"
        message={`Tem certeza que deseja alugar o livro "${book?.title}"?`}
        onConfirm={confirmRentBook}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Sim, alugar"
        cancelText="Cancelar"
      />
    </Layout>
  )
}

export default BookDetail
