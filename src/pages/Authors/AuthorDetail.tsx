import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Author } from '@/types'
import { getImageUrl } from '../../utils/imageUtils'
import './AuthorDetail.css'

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [author, setAuthor] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [biography, setBiography] = useState('')
  const { isAdmin } = useAuth()
  const [imgVersion, setImgVersion] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')

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
    handleUploadImageClick(file)
  }

  const handleUploadImageClick = async (fileParam?: File) => {
    const file = fileParam || imageFile
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await api.post(`/api/authors/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null)
      setImageFile(null)
      setImgVersion(v => v + 1)
      setError('')
      alert('Imagem do autor atualizada com sucesso!')
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem do autor'
      setError(msg)
      alert(`Erro: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAuthor()
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [id, previewUrl])

  const fetchAuthor = async () => {
    try {
      const response = await api.get(`/api/authors/${id}`)
      setAuthor(response.data)
      setBiography(response.data.biography || '')
      setLoading(false)
    } catch (err) {
      setError('Falha ao buscar detalhes do autor')
      setLoading(false)
    }
  }

  

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const response = await api.post(`/api/authors/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null)
      setImageFile(null)
      setError('')
      setImgVersion(v => v + 1)
      alert('Imagem do autor atualizada com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao enviar a imagem do autor')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateBiography = async () => {
    setUploading(true)
    try {
      await api.patch(`/api/authors/${id}`, {
        name_author: author?.name_author,
        biography: biography
      })
      setAuthor(prev => prev ? { ...prev, biography: biography } : null)
      setEditingBio(false)
      setError('')
      alert('Biografia atualizada com sucesso!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao atualizar a biografia')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Detalhes do Autor">
        <div className="loading">Carregando detalhes do autor...</div>
      </Layout>
    )
  }

  if (!author) {
    return (
      <Layout title="Detalhes do Autor">
        <div className="error-message">Autor não encontrado</div>
        <button onClick={() => navigate('/authors')}>Voltar para Autores</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Autor: ${author.name_author}`}>
      {error && <div className="error-message">{error}</div>}

      <section className="profile-section image-tight">
        <button onClick={() => navigate('/authors')} className="back-button">
          ← Voltar para Autores
        </button>

        <h2>{author.name_author}</h2>

        <div className="author-info">
          {previewUrl ? (
            <img src={previewUrl} alt="Pré-visualização selecionada" className="author-image" />
          ) : (
            <img
              src={getImageUrl(author.photo, 'author', false, author.name_author)}
              key={`${author.photo}-${imgVersion}`}
              alt={author.name_author}
              className="author-image"
            />
          )}
          
          {isAdmin && !author.photo && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Nenhuma foto definida para este autor ainda.
            </div>
          )}

          <div className="biography-section">
            <h3>Biografia</h3>
            {editingBio ? (
              <div>
                <textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Digite a biografia do autor..."
                  rows={6}
                  className="biography-textarea"
                />
                <div>
                  <button onClick={handleUpdateBiography} disabled={uploading}>
                    {uploading ? 'Salvando...' : 'Salvar Biografia'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false)
                      setBiography(author?.biography || '')
                    }}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="biography-text">
                  {author.biography || 'Nenhuma biografia disponível ainda.'}
                </p>
                {isAdmin && (
                  <button onClick={() => setEditingBio(true)}>
                    Editar Biografia
                  </button>
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="image-upload image-upload-section">
              <h3>Atualizar Foto do Autor</h3>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectImage}
                  className="file-input"
                  disabled={uploading}
                />
                {imageFile && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Selecionado: {imageFile.name}</div>
                )}
                <button onClick={() => handleUploadImageClick()} disabled={!imageFile || uploading}>
                  {uploading ? 'Enviando...' : 'Enviar Foto'}
                </button>
              </div>
            </div>
          )}
        </div>

      </section>

      
    </Layout>
  )
}

export default AuthorDetail
