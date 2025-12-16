import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'react-toastify'
import { GET_AUTHOR, UPDATE_AUTHOR } from '../../graphql/queries/authors'
import { UPLOAD_AUTHOR_IMAGE_MUTATION } from '../../graphql/queries/upload'
import Layout from '../../components/Layout'
import { useAuth } from '../../contexts/AuthContext'
import GraphQLUpload from '../../components/GraphQLUpload'
import { getImageUrl } from '../../utils/imageUtils'
import EditModal from '../../components/EditModal'
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

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
    setShowEditModal(false)
  }, [author, id])

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
          toast.success('Imagem do autor atualizada com sucesso!')
        } catch (err: any) {
          const msg = err?.message || 'Falha ao enviar a imagem do autor'
          setError(msg)
          toast.error(msg)
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
      toast.success('Biografia atualizada com sucesso!')
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
        <button onClick={() => navigate('/authors')} className="back-button">
          ← Voltar para Autores
        </button>
        <div className="author-header">
          <div className="author-image-section">
            <img 
              src={getImageUrlWithVersion(author.photo) || getImageUrl(author.photo, 'author')} 
              alt={author.name_author}
              className="author-photo-large"
            />
          </div>

          <div className="author-info">
            <h1>{author.name_author}</h1>
            
            <div className="biography-section">
              <h3>📖 Biografia</h3>
              <p>{author.biography || 'Biografia não disponível.'}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginTop: '20px' }}>
            {error}
          </div>
        )}

        <div className="author-actions">
          {isAdmin && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="edit-button"
            >
              ✏️ Editar Autor
            </button>
          )}
        </div>

        {isAdmin && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={async (data: any) => {
              if (!id) return

              setEditLoading(true)
              try {
                await updateAuthorMutation({
                  variables: {
                    id: parseInt(id),
                    updateAuthorInput: {
                      name_author: data.name_author?.trim() || author.name_author,
                      biography: data.description ?? author.biography ?? '',
                    },
                  },
                  refetchQueries: [
                    { query: GET_AUTHOR, variables: { id: parseInt(id) } },
                  ],
                  awaitRefetchQueries: true,
                })

                if (data.imageFile) {
                  await new Promise<void>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = async () => {
                      try {
                        const fileData = reader.result as string

                        await uploadAuthorImage({
                          variables: {
                            authorId: parseInt(id),
                            filename: data.imageFile.name,
                            fileData,
                          },
                          refetchQueries: [
                            { query: GET_AUTHOR, variables: { id: parseInt(id) } },
                          ],
                          awaitRefetchQueries: true,
                        })

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

                setError('')
                await refetch()
                toast.success('Autor atualizado com sucesso!')
              } catch (err: any) {
                const msg = err?.message || 'Falha ao atualizar autor'
                setError(msg)
                toast.error(msg)
              } finally {
                setEditLoading(false)
              }
            }}
            title="Editar Autor"
            type="author"
            initialData={{
              name_author: author.name_author,
              description: author.biography || '',
              photo: author.photo,
            }}
            loading={editLoading}
          />
        )}
      </div>
    </Layout>
  )
}

export default AuthorDetail
