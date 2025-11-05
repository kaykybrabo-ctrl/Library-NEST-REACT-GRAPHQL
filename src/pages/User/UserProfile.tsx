import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { RETURN_BOOK_MUTATION } from '../../graphql/queries/loans'
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from '../../graphql/queries/auth'
import { MY_LOANS_QUERY, MY_FAVORITE_BOOK_QUERY, GET_USER_PROFILE_QUERY, GET_USER_LOANS_QUERY, UPDATE_USER_DESCRIPTION_MUTATION, UPDATE_USER_DISPLAY_NAME_MUTATION } from '../../graphql/queries/users'
import { UPLOAD_USER_IMAGE_MUTATION } from '../../graphql/queries/upload'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import { User, Loan } from '../../types'
import { getImageUrl } from '../../utils/imageUtils'
import './UserProfile.css'

interface FavoriteBook {
  book_id: number
  title: string
  description?: string
  author_name?: string
}

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const { username: targetUsername } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [favoriteBook, setFavoriteBook] = useState<FavoriteBook | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
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
  
  const { data: meData, refetch: refetchMe } = useQuery(ME_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username
  })
  const { data: loansData, refetch: refetchLoans } = useQuery(MY_LOANS_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username
  })
  const { data: favoriteData, refetch: refetchFavorite } = useQuery(MY_FAVORITE_BOOK_QUERY, {
    skip: !!targetUsername && targetUsername !== user?.username
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
    if (favoriteData?.myFavoriteBook?.favoriteBook && !targetUsername) {
      const book = favoriteData.myFavoriteBook.favoriteBook
      setFavoriteBook({
        ...book,
        author_name: book.author?.name_author || 'Desconhecido'
      })
    } else if (favoriteData?.myFavoriteBook?.favoriteBook === null && !targetUsername) {
      setFavoriteBook(null)
    }
  }, [favoriteData, targetUsername])

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
          alert('Imagem de perfil atualizada com sucesso!')
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
      alert('Descrição atualizada com sucesso!')
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
      alert('Nome atualizado com sucesso!')
    } catch (e: any) {
      const errorMessage = e.message || 'Falha ao atualizar o nome'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const [returnBookMutation] = useMutation(RETURN_BOOK_MUTATION)

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
      alert('Livro devolvido com sucesso!')
      setError('')
    } catch (e: any) {
      const errorMessage = e.message || 'Falha ao devolver o livro'
      setError(errorMessage)
      alert(errorMessage)
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
        <button
          className={`tab ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('favorite')
            fetchFavoriteBook()
          }}
        >
          Livro Favorito
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2>Informações do Perfil</h2>
            <p><strong>E-mail:</strong> {displayedUser?.username || 'Desconhecido'}</p>
            <p><strong>Função:</strong> {displayedUser?.role || 'Usuário'}</p>

            <div className="display-name-section">
              <h3>Nome de Exibição</h3>
              {editingDisplayName && canEdit ? (
                <div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Digite seu nome (ex: João Silva)"
                    className="display-name-input"
                    maxLength={50}
                  />
                  <div>
                    <button onClick={handleUpdateDisplayName} disabled={uploading}>
                      {uploading ? 'Salvando...' : 'Salvar Nome'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingDisplayName(false)
                        setDisplayName(profile?.display_name || '')
                      }}
                      disabled={uploading}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{displayName || 'Nenhum nome definido'}</p>
                  {canEdit && (
                    <button onClick={() => setEditingDisplayName(true)}>
                      {profile?.display_name ? 'Editar Nome' : 'Adicionar Nome'}
                    </button>
                  )}
                </div>
              )}
              <p className="display-name-help">
                Este nome aparecerá quando você alugar livros
              </p>
            </div>

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
              {editingDescription && canEdit ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Conte-nos sobre você..."
                    rows={4}
                    className="description-textarea"
                  />
                  <div>
                    <button onClick={handleUpdateDescription} disabled={uploading}>
                      {uploading ? 'Salvando...' : 'Salvar Descrição'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingDescription(false)
                        setDescription(profile?.description || '')
                      }}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{displayedUser?.description || 'Nenhuma descrição adicionada ainda.'}</p>
                  {canEdit && (
                    <button onClick={() => setEditingDescription(true)}>
                      Editar Descrição
                    </button>
                  )}
                </div>
              )}
            </div>

            {canEdit && (
              <div className="image-upload">
                <h3>Atualizar Imagem de Perfil</h3>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onSelectImage}
                      disabled={uploading}
                    />
                    <button onClick={handleUploadImage} disabled={!imageFile || uploading}>
                      {uploading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'loans' && shouldShowLoansTab() && (
          <section className="profile-section">
            <h2>{isViewingOtherUser ? 'Livros Emprestados' : 'Meus Livros Emprestados'}</h2>
            {loans.length === 0 ? (
              <p>{isViewingOtherUser ? 'Este usuário não emprestou nenhum livro.' : 'Você ainda não emprestou nenhum livro.'}</p>
            ) : (
              <div>
                {loans.map(loan => (
                  <div key={loan.loans_id} className="loan-card">
                    <div>
                      <h4>{loan.title}</h4>
                      <p><strong>Data do Empréstimo:</strong> {new Date(loan.loan_date).toLocaleDateString('pt-BR')}</p>
                      {loan.description && <p>{loan.description}</p>}
                    </div>
                    <div className="loan-actions">
                      {loan.photo && (
                        <img
                          src={buildImageSrc(loan.photo, 'book', loan.title)}
                          alt={loan.title}
                          className="loan-book-image"
                        />
                      )}
                      {canEdit && (
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
          </section>
        )}

        {activeTab === 'favorite' && (
          <section className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Meu Livro Favorito</h2>
              <button onClick={fetchFavoriteBook} style={{ padding: '8px 16px' }}>
                🔄 Recarregar
              </button>
            </div>
            {!favoriteBook ? (
              <p>Você ainda não definiu um livro favorito.</p>
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
          </section>
        )}
      </div>
    </Layout>
  )
}

export default UserProfile
