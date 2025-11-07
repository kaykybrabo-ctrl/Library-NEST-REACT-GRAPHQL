import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useApolloClient } from '@apollo/client'
import { GET_BOOK } from '@/graphql/queries/books'
import { UPLOAD_BOOK_IMAGE_MUTATION } from '@/graphql/queries/upload'
import { RENT_BOOK_MUTATION, RETURN_BOOK_MUTATION, MY_BOOK_LOAN_QUERY, BOOK_LOAN_STATUS_QUERY } from '@/graphql/queries/loans'
import { CREATE_REVIEW_MUTATION, BOOK_REVIEWS_QUERY } from '@/graphql/queries/reviews'
import { ADD_TO_FAVORITES_MUTATION, MY_FAVORITE_BOOK_QUERY } from '@/graphql/queries/favorites'
import { ME_QUERY } from '@/graphql/queries/auth'
import Layout from '@/components/Layout'
import ErrorModal from '@/components/ErrorModal'
import SuccessModal from '@/components/SuccessModal'
import ConfirmModal from '@/components/ConfirmModal'
import { Rating, Typography, Box } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'
import { Book, Review } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'
import { ClickableUser } from '../../components/ClickableNames'
import GraphQLUpload from '@/components/GraphQLUpload'
import './BookDetail.css'

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const apolloClient = useApolloClient()
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const { isAdmin, user } = useAuth()
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
    fetchPolicy: 'cache-and-network',
  })

  const { data: bookLoanStatusData, refetch: refetchBookLoanStatus } = useQuery(BOOK_LOAN_STATUS_QUERY, {
    variables: { bookId: Number(id) },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })

  const [rentBook] = useMutation(RENT_BOOK_MUTATION)
  const [returnBook] = useMutation(RETURN_BOOK_MUTATION)
  const [createReview] = useMutation(CREATE_REVIEW_MUTATION)
  const [addToFavorites] = useMutation(ADD_TO_FAVORITES_MUTATION, {
    refetchQueries: [{ query: MY_FAVORITE_BOOK_QUERY }]
  })

  const book = bookData?.book
  const reviews = reviewsData?.bookReviews || []
  const currentUser = currentUserData?.me
  const userLoan = userLoanData?.myBookLoan?.loan
  const bookLoanStatus = bookLoanStatusData?.bookLoanStatus
  const isBookRentedByOther = bookLoanStatus?.isRented && !userLoan

  const buildImageSrc = (path?: string | null) => {
    const baseUrl = getImageUrl(path, 'book', false, book?.title)
    return imgVersion ? (baseUrl.includes('?') ? `${baseUrl}&v=${imgVersion}` : `${baseUrl}?v=${imgVersion}`) : baseUrl
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

  const [uploadBookImageMutation] = useMutation(UPLOAD_BOOK_IMAGE_MUTATION)

  const uploadImage = async (file: File) => {
    setUploading(true)
    setUploadStatus('Enviando imagem...')
    
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const fileData = reader.result as string
          
          await uploadBookImageMutation({
            variables: {
              bookId: parseInt(id || '0'),
              filename: file.name,
              fileData: fileData
            },
            refetchQueries: [{ query: GET_BOOK, variables: { id: parseInt(id || '0') } }]
          })
          
          setUploadStatus('Imagem atualizada com sucesso!')
          setImageFile(null)
          setPreviewUrl('')
        } catch (error: any) {
          setUploadStatus(`Erro: ${error.message}`)
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      setUploadStatus(`Erro: ${error.message}`)
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
    if (user?.role === 'admin') {
      setErrorModalMessage('Administradores não podem alugar livros. Apenas visualizar e gerenciar empréstimos.')
      setShowErrorModal(true)
      return
    }
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

    try {
      await returnBook({
        variables: { loanId: Number(userLoan.loans_id) },
        refetchQueries: [
          { query: MY_BOOK_LOAN_QUERY, variables: { bookId: Number(id) } },
          { query: BOOK_LOAN_STATUS_QUERY, variables: { bookId: Number(id) } }
        ],
        awaitRefetchQueries: true
      })
      
      setError('')
      setSuccessModalMessage(`"${book?.title}" foi devolvido com sucesso!`)
      setShowSuccessModal(true)
      
      await apolloClient.resetStore()
      
      setTimeout(async () => {
        await refetchUserLoan()
        await refetchBookLoanStatus()
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 100)
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao devolver livro'
      setError(errorMsg)
      setErrorModalMessage(errorMsg)
      setShowErrorModal(true)
    }
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
      <div className="book-detail-container">
        {error && <div className="error-message">{error}</div>}
        
        <button onClick={() => navigate('/books')} className="back-button">
          ← Voltar para Livros
        </button>

        <div className="book-header">
          <div className="book-image-section">
            {previewUrl ? (
              <img src={previewUrl} alt="Pré-visualização selecionada" className="book-image" />
            ) : (
              <img
                src={buildImageSrc(book.photo)}
                key={`${book.photo}-${imgVersion}`}
                alt={book.title}
                className="book-image"
              />
            )}

            {isAdmin && !book.photo && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Nenhuma imagem definida para este livro ainda.
              </div>
            )}
          </div>

          <div className="book-info">
            <h1>{book.title}</h1>
            <p><strong>Autor:</strong> {book.author?.name_author || 'Desconhecido'}</p>
            
            {book.categories && book.categories.length > 0 && (
              <p><strong>Gêneros:</strong> {book.categories.join(', ')}</p>
            )}
            
            {book.publishers && book.publishers.length > 0 && (
              <p><strong>Editoras:</strong> {book.publishers.join(', ')}</p>
            )}

            {book.description && (
              <div className="book-description">
                <h3>📖 Descrição</h3>
                <p>{book.description}</p>
              </div>
            )}
          </div>
        </div>

        {userLoan && (
          <div className="loan-info">
            <h4>📚 Status do Empréstimo</h4>
            <p><strong>Alugado em:</strong> {new Date(userLoan.loan_date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Vencimento:</strong> {new Date(userLoan.due_date).toLocaleDateString('pt-BR')}</p>
            <div className={`days-remaining ${(() => {
              if (userLoan.is_overdue) return 'overdue';
              
              const totalHours = Math.floor(userLoan.hours_remaining);
              let remainingHours = totalHours - (userLoan.days_remaining * 24);
              let adjustedDays = userLoan.days_remaining;
              
              if (remainingHours >= 24) {
                adjustedDays += Math.floor(remainingHours / 24);
              }
              
              return adjustedDays <= 1 ? 'urgent' : adjustedDays <= 3 ? 'warning' : 'normal';
            })()}`}>
              {(() => {
                if (userLoan.is_overdue) {
                  return '⚠️ Atrasado!';
                }
                
                const totalHours = Math.floor(userLoan.hours_remaining);
                let remainingHours = totalHours - (userLoan.days_remaining * 24);
                let adjustedDays = userLoan.days_remaining;
                
                if (remainingHours >= 24) {
                  adjustedDays += Math.floor(remainingHours / 24);
                  remainingHours = remainingHours % 24;
                }
                
                if (adjustedDays === 0) {
                  return '⏰ Vence hoje!';
                } else if (adjustedDays === 1) {
                  return `⏰ Vence amanhã (${remainingHours}h restantes)`;
                } else {
                  return `📅 ${adjustedDays} dias e ${remainingHours}h restantes`;
                }
              })()}
            </div>
            {userLoan.is_overdue && (
              <div className="fine-amount">
                <strong>💰 Multa: R$ {userLoan.fine_amount.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        <div className="book-actions-section">
            <h4>Ações do Livro</h4>
            {userLoan ? (
              <>
                <div className="loan-status-info">
                  <p><strong>📚 Você tem este livro alugado</strong></p>
                  <p><strong>Alugado em:</strong> {new Date(userLoan.loan_date).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Vencimento:</strong> {new Date(userLoan.due_date).toLocaleDateString('pt-BR')}</p>
                  <div className={`days-remaining ${(() => {
                    if (userLoan.is_overdue) return 'overdue';
                    
                    const totalHours = Math.floor(userLoan.hours_remaining);
                    let remainingHours = totalHours - (userLoan.days_remaining * 24);
                    let adjustedDays = userLoan.days_remaining;
                    
                    if (remainingHours >= 24) {
                      adjustedDays += Math.floor(remainingHours / 24);
                    }
                    
                    return adjustedDays <= 1 ? 'urgent' : adjustedDays <= 3 ? 'warning' : 'normal';
                  })()}`}>
                    {(() => {
                      if (userLoan.is_overdue) {
                        return '⚠️ Atrasado!';
                      }
                      
                      const totalHours = Math.floor(userLoan.hours_remaining);
                      let remainingHours = totalHours - (userLoan.days_remaining * 24);
                      let adjustedDays = userLoan.days_remaining;
                      
                      if (remainingHours >= 24) {
                        adjustedDays += Math.floor(remainingHours / 24);
                        remainingHours = remainingHours % 24;
                      }
                      
                      if (adjustedDays === 0) {
                        return '⏰ Vence hoje!';
                      } else if (adjustedDays === 1) {
                        return `⏰ Vence amanhã (${remainingHours}h restantes)`;
                      } else {
                        return `📅 ${adjustedDays} dias e ${remainingHours}h restantes`;
                      }
                    })()}
                  </div>
                  {userLoan.is_overdue && (
                    <div className="fine-amount">
                      <strong>💰 Multa: R$ {userLoan.fine_amount.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
                <div className="book-actions">
                  <button onClick={handleReturnBook}>Devolver Livro</button>
                  <button onClick={handleFavoriteBook}>⭐ Adicionar aos Favoritos</button>
                </div>
              </>
            ) : isBookRentedByOther ? (
              <>
                <p>❌ Este livro está alugado por outro usuário.</p>
                <div className="book-actions">
                  <button disabled>Livro Indisponível</button>
                  <button onClick={handleFavoriteBook}>⭐ Adicionar aos Favoritos</button>
                </div>
              </>
            ) : (
              <>
                <div className="book-actions">
                  {user?.role === 'admin' ? (
                    <button disabled>👑 Modo Administrador - Apenas Visualização</button>
                  ) : (
                    <button onClick={handleRentBook}>📚 Alugar Livro</button>
                  )}
                  <button onClick={handleFavoriteBook}>⭐ Adicionar aos Favoritos</button>
                </div>
              </>
            )}
        </div>


        {isAdmin && (
          <GraphQLUpload 
            type="book"
            entityId={parseInt(id || '0')} 
            title="Upload de Imagem do Livro"
            onSuccess={() => {
              setImgVersion(v => v + 1);
            }}
            onImageUpdate={() => {
              setImgVersion(v => v + 1);
            }}
          />
        )}
      </div>

      <section className="form-section review-form">
        <h3>Escreva uma Avaliação</h3>
        {!currentUser ? (
          <p>Faça login para escrever uma avaliação.</p>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <div className="review-form-content">
              <div className="review-rating-section">
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
              </div>

              <div className="review-comment-section">
                <label htmlFor="comment">Comentário:</label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  className="review-textarea"
                  placeholder="Compartilhe sua opinião sobre este livro..."
                />
                <button type="submit">Enviar Avaliação</button>
              </div>
            </div>
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
                  <strong>
                    <ClickableUser
                      username={review.user?.username || 'usuario'}
                      displayName={review.user?.display_name}
                      className="clickable-user"
                    />
                  </strong>
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
