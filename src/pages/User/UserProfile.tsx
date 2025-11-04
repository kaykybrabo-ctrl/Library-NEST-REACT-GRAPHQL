import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { RETURN_BOOK_MUTATION } from '@/graphql/queries/loans'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { User, Loan } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'
import './UserProfile.css'

interface FavoriteBook {
  book_id: number
  title: string
  description?: string
  photo?: string
  author_name?: string
}

const UserProfile: React.FC = () => {
  const { user } = useAuth()
  const { username: paramUsername } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [favoriteBook, setFavoriteBook] = useState<FavoriteBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'loans' | 'favorite'>('profile')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imgVersion, setImgVersion] = useState(0)
  const [description, setDescription] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [editingDisplayName, setEditingDisplayName] = useState(false)
  const isOwnProfile = !paramUsername || 
    paramUsername === user?.username || 
    (paramUsername.includes('@') && paramUsername === user?.username) ||
    (!paramUsername.includes('@') && user?.username?.includes('@') && paramUsername === user.username.split('@')[0])
  
  const canEdit = user && (
    isOwnProfile ||
    (user.role === 'admin')
  )
  const targetUsername = paramUsername || user?.username

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
    
    fetchProfile()
    fetchLoans()
    fetchFavoriteBook()
  }, [paramUsername, user?.username])

  useEffect(() => {
    if (profile?.description !== undefined) {
      setDescription(profile.description || '')
    }
    if (profile?.display_name !== undefined) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile?.description, profile?.display_name])

  const fetchProfile = async () => {
    try {
      const url = targetUsername && targetUsername !== user?.username 
        ? `/api/get-profile?username=${targetUsername}`
        : '/api/get-profile'
      
      const response = await api.get(url)
      setProfile(response.data)
      
      if (targetUsername && targetUsername !== user?.username) {
        setViewingUser(response.data)
      }
      
      setError('')
    } catch (e: any) {
      if (e.response?.status === 404) {
        setError('Usuário não encontrado.')
      } else if (e.response?.status === 403) {
        setError('Você não tem permissão para visualizar este perfil.')
      } else {
        setError('Falha ao carregar o perfil. Verifique sua conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    if (!targetUsername) return

    const response = await api.get(`/api/loans?username=${targetUsername}`)
    setLoans(response.data)
  }

  const fetchFavoriteBook = async () => {
    if (!targetUsername) {
      return
    }

    try {
      const response = await api.get(`/api/users/favorite?username=${targetUsername}`)
      if (response.data) {
        const favoriteData = {
          ...response.data,
          author_name: response.data.author?.name_author || 'Desconhecido'
        }
        setFavoriteBook(favoriteData)
      } else {
        setFavoriteBook(null)
      }
    } catch (error) {
      setFavoriteBook(null)
    }
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
  }

  const handleUploadImage = async () => {
    if (!imageFile || !canEdit) {
      if (!canEdit) {
        setError('Você não tem permissão para editar este perfil')
      }
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('username', targetUsername || 'guest')
      
      const resp = await api.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (resp?.data) {
        setProfile(resp.data)
      }
      setImgVersion((v) => v + 1)
      setImageFile(null)
      setError('')
      alert('Imagem de perfil atualizada com sucesso!')
    } catch (e) {
      setError('Falha ao enviar a imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateDescription = async () => {
    if (!canEdit) {
      setError('Você não tem permissão para editar este perfil')
      return
    }

    setUploading(true)

    const response = await api.post('/api/save-description', {
      username: targetUsername,
      description: description
    })

    setProfile(prev => prev ? {
      ...prev,
      description: description
    } : null)
    
    setEditingDescription(false)
    setError('')
    alert('Descrição atualizada com sucesso!')
    setUploading(false)
  }

  const handleUpdateDisplayName = async () => {
    if (!canEdit) {
      setError('Você não tem permissão para editar este perfil')
      return
    }

    setUploading(true)

    try {
      await api.post('/api/save-display-name', {
        display_name: displayName,
        username: targetUsername
      })

      setProfile(prev => prev ? {
        ...prev,
        display_name: displayName
      } : null)
      
      setEditingDisplayName(false)
      setError('')
      alert('Nome atualizado com sucesso!')
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Falha ao atualizar o nome'
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
  const isViewingOtherUser = paramUsername && paramUsername !== user?.username
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
                      style={{marginLeft: '10px'}}
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
              <p style={{fontSize: '0.9em', color: '#666', marginTop: '5px'}}>
                Este nome aparecerá quando você alugar livros
              </p>
            </div>

            <div className="profile-image-container">
              <h3>Imagem de Perfil</h3>
              <div className="profile-image-display">
                {profile?.profile_image ? (
                  <img
                    src={buildImageSrc(profile.profile_image, 'profile')}
                    key={`${profile?.profile_image}-${imgVersion}`}
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
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '200px',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9f9f9',
                    color: '#666'
                  }}>
                    Nenhuma imagem de perfil enviada ainda
                  </div>
                )}
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
