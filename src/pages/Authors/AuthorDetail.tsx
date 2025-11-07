import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_AUTHOR, UPDATE_AUTHOR } from '../../graphql/queries/authors'
import { UPLOAD_AUTHOR_IMAGE_MUTATION } from '../../graphql/queries/upload'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import GraphQLUpload from '../../components/GraphQLUpload'
import { getImageUrl } from '../../utils/imageUtils'
import './AuthorDetail.css'

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imgVersion, setImgVersion] = useState(0)
  const [error, setError] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [biography, setBiography] = useState('')

  const { data, loading, error: queryError, refetch } = useQuery(GET_AUTHOR, {
    variables: { id: parseInt(id || '0') },
    errorPolicy: 'all'
  })

  const [updateAuthorMutation] = useMutation(UPDATE_AUTHOR)
  const [uploadAuthorImage] = useMutation(UPLOAD_AUTHOR_IMAGE_MUTATION)

  const author = data?.author

  useEffect(() => {
    if (author?.biography) {
      setBiography(author.biography)
    }
  }, [author])

  const getImageUrlWithVersion = (path?: string) => {
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
  }

  const uploadImage = async () => {
    if (!imageFile || !id) return
    
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const fileData = reader.result as string
          
          await uploadAuthorImage({
            variables: {
              authorId: parseInt(id),
              filename: imageFile.name,
              fileData: fileData
            },
            refetchQueries: [{ query: GET_AUTHOR, variables: { id: parseInt(id) } }]
          })
          
          setImageFile(null)
          setImgVersion(v => v + 1)
          setError('')
          refetch()
          alert('Imagem do autor atualizada com sucesso!')
        } catch (err: any) {
          const msg = err?.message || 'Falha ao enviar a imagem do autor'
          setError(msg)
          alert(msg)
        } finally {
          setUploading(false)
        }
      }
      reader.readAsDataURL(imageFile)
    } catch (err: any) {
      const msg = err?.message || 'Falha ao processar a imagem'
      setError(msg)
      setUploading(false)
    }
  }

  const handleUploadImageClick = async () => {
    if (!imageFile) return
    await uploadImage()
  }

  const handleUpdateBio = async () => {
    if (!id || !isAdmin) return
    
    setUploading(true)
    try {
      await updateAuthorMutation({
        variables: {
          id: parseInt(id),
          updateAuthorInput: {
            biography: biography
          }
        }
      })
      setEditingBio(false)
      setError('')
      refetch()
      alert('Biografia atualizada com sucesso!')
    } catch (err: any) {
      setError(err?.message || 'Falha ao atualizar a biografia')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Carregando...">
        <div className="loading">Carregando autor...</div>
      </Layout>
    )
  }

  if (queryError || !author) {
    return (
      <Layout title="Erro">
        <div className="error">
          <h2>❌ {queryError?.message || 'Autor não encontrado'}</h2>
          <button onClick={() => navigate('/authors')}>🔙 Voltar aos Autores</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={author.name_author}>
      <div className="author-detail-container">
        <div className="author-header">
          <div className="author-image-section">
            <img 
              src={getImageUrlWithVersion(author.photo) || getImageUrl(author.photo, 'author')} 
              alt={author.name_author}
              className="author-photo-large"
            />
            
            {isAdmin && (
              <GraphQLUpload 
                type="author"
                entityId={parseInt(id || '0')} 
                title="Upload de Imagem do Autor"
                onSuccess={() => {
                  setImgVersion(v => v + 1);
                }}
                onImageUpdate={() => {
                  setImgVersion(v => v + 1);
                }}
              />
            )}
          </div>

          <div className="author-info">
            <h1>{author.name_author}</h1>
            
            <div className="biography-section">
              <h3>📖 Biografia</h3>
              {editingBio && isAdmin ? (
                <div>
                  <textarea
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={6}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <div>
                    <button onClick={handleUpdateBio} disabled={uploading}>
                      {uploading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingBio(false)
                        setBiography(author.biography || '')
                      }}
                      style={{ marginLeft: '10px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{author.biography || 'Biografia não disponível.'}</p>
                  {isAdmin && (
                    <button 
                      onClick={() => setEditingBio(true)}
                      style={{ marginTop: '10px' }}
                    >
                      ✏️ Editar Biografia
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginTop: '20px' }}>
            {error}
          </div>
        )}

        <div className="author-actions">
          <button onClick={() => navigate('/authors')}>
            🔙 Voltar aos Autores
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default AuthorDetail
