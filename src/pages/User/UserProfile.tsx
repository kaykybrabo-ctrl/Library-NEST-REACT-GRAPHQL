import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { RETURN_BOOK_MUTATION } from '../../graphql/queries/loans'
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from '../../graphql/queries/auth'
import { MY_LOANS_QUERY, MY_FAVORITE_BOOK_QUERY, USER_FAVORITE_BOOK_QUERY, GET_USER_PROFILE_QUERY, GET_USER_LOANS_QUERY, UPDATE_USER_DESCRIPTION_MUTATION, UPDATE_USER_DISPLAY_NAME_MUTATION } from '../../graphql/queries/users'
import { UPLOAD_USER_IMAGE_MUTATION } from '../../graphql/queries/upload'
import Layout from '../../components/Layout'
import EditModal from '../../components/EditModal'
import { useAuth } from '../../contexts/AuthContext'
import { User, Loan } from '../../types'
import { getImageUrl } from '../../utils/imageUtils'
import './UserProfile.css'

interface FavoriteBook {
  book_id: number
  title: string
  description?: string
  author_name?: string
  photo?: string
}

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const { username: targetUsername } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [favoriteBook, setFavoriteBook] = useState<FavoriteBook | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loanFilter, setLoanFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [editingDisplayName, setEditingDisplayName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imgVersion, setImgVersion] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  const { data: meData, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username
  })
  const { data: loansData, refetch: refetchLoans } = useQuery(MY_LOANS_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username
  })
  const { data: favoriteData, refetch: refetchFavorite } = useQuery(MY_FAVORITE_BOOK_QUERY, {
    fetchPolicy: 'cache-and-network'
  })
  const { data: otherFavoriteData, refetch: refetchOtherFavorite } = useQuery(USER_FAVORITE_BOOK_QUERY, {
    variables: { username: targetUsername || '' },
    skip: !targetUsername || targetUsername === user?.username,
    fetchPolicy: 'cache-and-network'
  })
  const isOwnProfile = !targetUsername || targetUsername === user?.username
  const canEdit = user && (
    isOwnProfile ||
    (user.role === 'admin')
  )

  const buildImageSrc = (path?: string | null, type: 'book' | 'profile' = 'book', name?: string) => {
    const baseUrl = getImageUrl(path, type, false, name)
    return imgVersion ? (baseUrl.includes('?') ? `${baseUrl}&v=${imgVersion}` : `${baseUrl}?v=${imgVersion}`) : baseUrl
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    setProfile(null)
    setViewingUser(null)
    setLoans([])
    setFavoriteBook(null)
    setLoading(true)
  }, [targetUsername, user?.username])

  useEffect(() => {
    if (profile?.description !== undefined) {
      setDescription(profile.description || '')
    }
    if (profile?.display_name !== undefined) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile?.description, profile?.display_name])

  const { data: profileData, refetch: refetchProfile, loading: profileLoading, error: profileError } = useQuery(ME_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username,
    fetchPolicy: 'cache-and-network'
  })

  const { data: otherUserData, loading: otherUserLoading, error: otherUserError } = useQuery(GET_USER_PROFILE_QUERY, {
    variables: { username: targetUsername || '' },
    skip: !targetUsername || targetUsername === user?.username,
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if (otherUserData?.userProfile) {
      setViewingUser(otherUserData.userProfile)
      setError('')
    } else if (otherUserError) {
      setError('Erro ao carregar o perfil do usuário.')
    }
  }, [otherUserData, otherUserError])

  useEffect(() => {
    if (profileData?.me) {
      setProfile(profileData.me)
      setError('')
    } else if (profileError) {
      setError('Erro ao carregar o perfil do usuário.')
    }
  }, [profileData, profileError])

  useEffect(() => {
    setLoading(profileLoading || otherUserLoading)
  }, [profileLoading, otherUserLoading])

  useEffect(() => {
    let bookFromQuery: any | null | undefined = undefined

    if (isOwnProfile) {
      bookFromQuery = favoriteData?.myFavoriteBook?.favoriteBook
    } else if (targetUsername) {
      bookFromQuery = otherFavoriteData?.userFavoriteBook?.favoriteBook
    }

    if (bookFromQuery) {
      setFavoriteBook({
        ...bookFromQuery,
        author_name: bookFromQuery.author?.name_author || 'Desconhecido'
      })
    } else if (bookFromQuery === null) {
      setFavoriteBook(null)
    }
  }, [favoriteData, otherFavoriteData, targetUsername, isOwnProfile])

  const { data: userLoansData, refetch: refetchUserLoans } = useQuery(GET_USER_LOANS_QUERY, {
    variables: { username: targetUsername || '' },
    skip: !targetUsername || targetUsername === user?.username,
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if (loansData?.myLoans && !targetUsername) {
      setLoans(loansData.myLoans)
    } else if (userLoansData?.userLoans && targetUsername) {
      setLoans(userLoansData.userLoans)
    }
  }, [loansData, userLoansData, targetUsername])

  const fetchLoans = async () => {
    if (targetUsername && targetUsername !== user?.username) {
      await refetchUserLoans()
    } else {
      await refetchLoans()
    }
  }

  const fetchFavoriteBook = async () => {
    await refetchFavorite()
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
  }

  const [uploadUserImage] = useMutation(UPLOAD_USER_IMAGE_MUTATION)
  const [updateProfileMutation] = useMutation(UPDATE_PROFILE_MUTATION)

  const handleUploadImage = async () => {
    if (!imageFile || !canEdit) {
      if (!canEdit) {
        setError('Você não tem permissão para editar este perfil')
      }
      return
    }
    
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const fileData = reader.result as string
          
          const { data } = await uploadUserImage({
            variables: {
              username: targetUsername || user?.username || '',
              filename: imageFile.name,
              fileData: fileData
            }
          })
          
          setProfile(prev => prev ? {
            ...prev,
            profile_image: data.uploadUserImage.profile_image
          } : null)
          
          setImgVersion((v) => v + 1)
          setImageFile(null)
          setError('')
          toast.success('Imagem de perfil atualizada com sucesso!')
        } catch (error: any) {
          setError(`Falha ao enviar a imagem: ${error.message}`)
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(imageFile)
    } catch (e) {
      setError('Falha ao processar a imagem')
      setUploading(false)
    }
  }

  const [updateUserDescription] = useMutation(UPDATE_USER_DESCRIPTION_MUTATION)

  const handleUpdateDescription = async () => {
    if (!canEdit) {
      setError('Você não tem permissão para editar este perfil')
      return
    }

    setUploading(true)

    try {
      await updateUserDescription({
        variables: {
          username: targetUsername || user?.username || '',
          description: description
        }
      })

      setProfile(prev => prev ? {
        ...prev,
        description: description
      } : null)
      
      setEditingDescription(false)
      setError('')
      toast.success('Descrição atualizada com sucesso!')
    } catch (e: any) {
      setError('Falha ao atualizar a descrição')
    } finally {
      setUploading(false)
    }
  }

  const [updateUserDisplayName] = useMutation(UPDATE_USER_DISPLAY_NAME_MUTATION)

  const handleUpdateDisplayName = async () => {
    if (!canEdit) {
      setError('Você não tem permissão para editar este perfil')
      return
    }

    setUploading(true)

    try {
      await updateUserDisplayName({
        variables: {
          username: targetUsername || user?.username || '',
          displayName: displayName
        }
      })

      setProfile(prev => prev ? {
        ...prev,
        display_name: displayName
      } : null)
      
      setEditingDisplayName(false)
      setError('')
      toast.success('Nome atualizado com sucesso!')
    } catch (e: any) {
      const errorMessage = e.message || 'Falha ao atualizar o nome'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const [returnBookMutation] = useMutation(RETURN_BOOK_MUTATION)

  const handleEditProfile = async (data: any) => {
    if (!canEdit || !isOwnProfile || !profile) {
      const message = 'Você não tem permissão para editar este perfil'
      setError(message)
      toast.error(message)
      return
    }

    setEditLoading(true)

    try {
      await updateProfileMutation({
        variables: {
          updateProfileInput: {
            display_name: data.display_name ?? profile.display_name ?? '',
            description: data.description ?? profile.description ?? '',
          },
        },
      })

      let newProfileImage = profile.profile_image

      if (data.imageFile) {
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async () => {
            try {
              const fileData = reader.result as string

              const { data: uploadData } = await uploadUserImage({
                variables: {
                  username: user?.username || '',
                  filename: data.imageFile.name,
                  fileData,
                },
              })

              newProfileImage = uploadData?.uploadUserImage?.profile_image || newProfileImage
              setImgVersion((v) => v + 1)
              resolve()
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => {
            reject(new Error('Falha ao ler o arquivo de imagem'))
          }
          reader.readAsDataURL(data.imageFile)
        })
      }

      setProfile(prev => prev ? {
        ...prev,
        display_name: data.display_name ?? prev.display_name,
        description: data.description ?? prev.description,
        profile_image: newProfileImage,
      } : null)

      setDisplayName(data.display_name ?? '')
      setDescription(data.description ?? '')
      setError('')
      await refetchMe()
      toast.success('Perfil atualizado com sucesso!')
    } catch (e: any) {
      const errorMessage = e?.message || 'Falha ao atualizar o perfil'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  const handleReturnBook = async (loanId: number, bookTitle?: string) => {
    const confirmMessage = bookTitle 
      ? `Tem certeza que deseja devolver o livro "${bookTitle}"?`
      : 'Tem certeza que deseja devolver este livro?'
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      await returnBookMutation({
        variables: { loanId }
      })

      fetchLoans()
      toast.success('Livro devolvido com sucesso!')
      setError('')
    } catch (e: any) {
      const errorMessage = e.message || 'Falha ao devolver o livro'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <Layout title="Perfil do Usuário">
        <div className="loading">Carregando perfil...</div>
      </Layout>
    )
  }

  const displayedUser = viewingUser || profile
  const isViewingOtherUser = targetUsername && targetUsername !== user?.username
  const pageTitle = isViewingOtherUser 
    ? `Perfil de ${displayedUser?.display_name || displayedUser?.username || 'Usuário'}` 
    : 'Meu Perfil'
  
  const shouldShowLoansTab = () => {
    if (isViewingOtherUser) {
      return user?.role === 'admin'
    } else {
      return user?.role !== 'admin'
    }
  }

  const getLoanStatus = (loan: Loan): 'active' | 'returned' | 'overdue' => {
    if (loan.returned_at) return 'returned'
    if (loan.is_overdue) return 'overdue'
    return 'active'
  }

  const getFilteredLoans = () => {
    return loans.filter((loan) => {
      const status = getLoanStatus(loan)
      switch (loanFilter) {
        case 'active':
          return status === 'active'
        case 'returned':
          return status === 'returned'
        case 'overdue':
          return status === 'overdue'
        case 'all':
        default:
          return true
      }
    })
  }

  const countByStatus = (status: 'active' | 'returned' | 'overdue') =>
    loans.filter((loan) => getLoanStatus(loan) === status).length

  const getLoanStatusBadge = (loan: Loan) => {
    const status = getLoanStatus(loan)

    if (status === 'returned') {
      return <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Devolvido</span>
    }

    if (status === 'overdue') {
      return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>⚠️ Atrasado</span>
    }

    return <span style={{ color: '#ffc107', fontWeight: 'bold' }}>📚 Ativo</span>
  }

  return (
    <Layout title={pageTitle}>
      {error && <div className="error-message">{error}</div>}
      
      {isViewingOtherUser && (
        <div className="viewing-other-user-notice">
          <p>📋 Visualizando perfil de <strong>{displayedUser?.display_name || displayedUser?.username}</strong></p>
          {!canEdit && <p>⚠️ Você não pode editar este perfil</p>}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        {shouldShowLoansTab() && (
          <button
            className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            {isViewingOtherUser ? 'Empréstimos' : 'Meus Empréstimos'}
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Informações do Perfil</h2>
              {canEdit && (
                <button 
                  onClick={() => setShowEditModal(true)}
                  style={{
                    background: '#162c74',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ✏️ Editar Perfil
                </button>
              )}
            </div>
            <p><strong>Nome de Exibição:</strong> {displayName || 'Nenhum nome definido'}</p>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '-10px' }}>Este nome aparecerá quando você alugar livros</p>
            <p><strong>E-mail:</strong> {displayedUser?.username || 'Desconhecido'}</p>
            <p><strong>Função:</strong> {displayedUser?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>

            <div className="profile-image-container">
              <h3>Imagem de Perfil</h3>
              <div className="profile-image-display">
                <img
                  src={buildImageSrc(profile?.profile_image, 'profile')}
                  key={`${profile?.profile_image || 'default'}-${imgVersion}`}
                  alt="Perfil"
                  className="profile-image"
                  style={{
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    objectFit: 'cover',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            <div className="description-section">
              <h3>Descrição</h3>
              <p>{displayedUser?.description || 'Nenhuma descrição adicionada ainda.'}</p>
            </div>

            {displayedUser?.role !== 'admin' && (
              <div className="favorite-book-section">
                <h3>
                  {isViewingOtherUser
                    ? `Livro Favorito de ${displayedUser?.display_name || displayedUser?.username || 'Usuário'}`
                    : 'Meu Livro Favorito'}
                </h3>
                {!favoriteBook ? (
                  <p>
                    {isViewingOtherUser
                      ? `${displayedUser?.display_name || displayedUser?.username || 'Este usuário'} ainda não definiu um livro favorito.`
                      : 'Você ainda não definiu um livro favorito.'}
                  </p>
                ) : (
                  <div className="favorite-book-card">
                    {favoriteBook.photo && (
                      <img
                        src={buildImageSrc(favoriteBook.photo, 'book', favoriteBook.title)}
                        alt={favoriteBook.title}
                        className="favorite-book-image"
                      />
                    )}
                    <div>
                      <h3>{favoriteBook.title}</h3>
                      <p><strong>Autor:</strong> {favoriteBook.author_name || 'Desconhecido'}</p>
                      {favoriteBook.description && (
                        <p><strong>Descrição:</strong> {favoriteBook.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {canEdit && (
              <div className="profile-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (isOwnProfile) {
                      setShowEditModal(true)
                    } else {
                      setEditingDisplayName(true)
                      setEditingDescription(true)
                    }
                  }}
                >
                  EDITAR PERFIL
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'loans' && shouldShowLoansTab() && (
          <section className="profile-section">
            <h2>{isViewingOtherUser ? 'Livros Emprestados' : 'Meus Livros Emprestados'}</h2>
            {loans.length === 0 ? (
              <p style={{ 
                textAlign: 'center', 
                color: '#6c757d', 
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                {loanFilter === 'all' 
                  ? (isViewingOtherUser 
                      ? 'Este usuário não possui livros emprestados.' 
                      : 'Você ainda não pegou nenhum livro emprestado.')
                  : `Nenhum empréstimo ${
                      loanFilter === 'active' ? 'ativo' : 
                      loanFilter === 'returned' ? 'devolvido' : 
                      loanFilter === 'overdue' ? 'atrasado' : ''
                    } encontrado.`
                }
              </p>
            ) : (
              <>
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ marginBottom: '10px', color: '#495057' }}>Filtrar por:</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setLoanFilter('all')}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        backgroundColor: loanFilter === 'all' ? '#007bff' : '#fff',
                        color: loanFilter === 'all' ? '#fff' : '#007bff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      📚 Todos ({loans.length})
                    </button>
                    <button
                      onClick={() => setLoanFilter('active')}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        backgroundColor: loanFilter === 'active' ? '#ffc107' : '#fff',
                        color: loanFilter === 'active' ? '#000' : '#ffc107',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      📖 Ativos ({countByStatus('active')})
                    </button>
                    <button
                      onClick={() => setLoanFilter('returned')}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #28a745',
                        borderRadius: '4px',
                        backgroundColor: loanFilter === 'returned' ? '#28a745' : '#fff',
                        color: loanFilter === 'returned' ? '#fff' : '#28a745',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Devolvidos ({countByStatus('returned')})
                    </button>
                    <button
                      onClick={() => setLoanFilter('overdue')}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        backgroundColor: loanFilter === 'overdue' ? '#dc3545' : '#fff',
                        color: loanFilter === 'overdue' ? '#fff' : '#dc3545',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ⚠️ Atrasados ({countByStatus('overdue')})
                    </button>
                  </div>
                </div>

                {getFilteredLoans().length === 0 ? (
                  <p style={{ 
                    textAlign: 'center', 
                    color: '#6c757d', 
                    padding: '40px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    {`Nenhum empréstimo ${
                      loanFilter === 'active' ? 'ativo' : 
                      loanFilter === 'returned' ? 'devolvido' : 
                      loanFilter === 'overdue' ? 'atrasado' : ''
                    } encontrado.`}
                  </p>
                ) : (
                  <div>
                    {getFilteredLoans().map(loan => (
                      <div key={loan.loans_id} className="loan-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>{loan.title}</h4>
                            {getLoanStatusBadge(loan)}
                          </div>
                          <p><strong>Data do Empréstimo:</strong> {new Date(loan.loan_date).toLocaleDateString('pt-BR')}</p>
                          {loan.due_date && (
                            <p><strong>📅 Devolução prevista:</strong> {new Date(loan.due_date).toLocaleDateString('pt-BR')}</p>
                          )}
                          {loan.returned_at && (
                            <p><strong>✅ Devolvido em:</strong> {new Date(loan.returned_at).toLocaleDateString('pt-BR')}</p>
                          )}
                          {loan.description && <p style={{ color: '#6c757d', fontStyle: 'italic' }}>{loan.description}</p>}
                        </div>
                        <div className="loan-actions">
                          {loan.photo && (
                            <img
                              src={buildImageSrc(loan.photo, 'book', loan.title)}
                              alt={loan.title}
                              className="loan-book-image"
                            />
                          )}
                          {canEdit && getLoanStatus(loan) !== 'returned' && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                handleReturnBook(loan.loans_id, loan.title)
                              }}
                              className="return-button"
                            >
                              Devolver Livro
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
      {canEdit && isOwnProfile && profile && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditProfile}
          title="Editar Perfil"
          type="profile"
          initialData={{
            username: profile.username,
            display_name: profile.display_name || '',
            description: profile.description || '',
            profile_image: profile.profile_image,
          }}
          loading={editLoading}
        />
      )}
    </Layout>
  )
}

export default UserProfile
