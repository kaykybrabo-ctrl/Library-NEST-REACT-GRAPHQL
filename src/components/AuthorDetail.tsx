import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { Author } from '../types'
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
      setError('Please select a valid image file (JPG, PNG, GIF, WebP)')
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
      try { alert('Author image updated successfully!') } catch {}
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to upload author image'
      setError(msg)
      try { alert(`Error: ${msg}`) } catch {}
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
      setError('Failed to fetch author details')
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
      try { alert('Author image updated successfully!') } catch {}
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload author image')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateBiography = async () => {
    setUploading(true)
    try {
      await api.put(`/api/authors/${id}`, {
        name_author: author?.name_author,
        biography: biography
      })
      setAuthor(prev => prev ? { ...prev, biography: biography } : null)
      setEditingBio(false)
      setError('')
      alert('Biography updated successfully!')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update biography')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Author Details">
        <div className="loading">Loading author details...</div>
      </Layout>
    )
  }

  if (!author) {
    return (
      <Layout title="Author Details">
        <div className="error-message">Author not found</div>
        <button onClick={() => navigate('/authors')}>Back to Authors</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Author: ${author.name_author}`}>
      {error && <div className="error-message">{error}</div>}

      <section className="profile-section image-tight">
        <button onClick={() => navigate('/authors')} className="back-button">
          ← Back to Authors
        </button>

        <h2>{author.name_author}</h2>

        <div className="author-info">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected preview" className="author-image" />
          ) : author.photo ? (
            <img
              src={buildImageSrc(author.photo)}
              key={`${author.photo}-${imgVersion}`}
              alt={author.name_author}
              className="author-image"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/api/uploads/default-user.png'
              }}
            />
          ) : (
            <div className="image-placeholder">No photo set yet. Select a file below to upload.</div>
          )}
          
          {!author.photo && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              No photo set for this author yet.
            </div>
          )}

          <div className="biography-section">
            <h3>Biography</h3>
            {editingBio ? (
              <div>
                <textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Enter author biography..."
                  rows={6}
                  className="biography-textarea"
                />
                <div>
                  <button onClick={handleUpdateBiography} disabled={uploading}>
                    {uploading ? 'Saving...' : 'Save Biography'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false)
                      setBiography(author?.biography || '')
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="biography-text">
                  {author.biography || 'No biography available yet.'}
                </p>
                {isAdmin && (
                  <button onClick={() => setEditingBio(true)}>
                    Edit Biography
                  </button>
                )}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="image-upload image-upload-section">
              <h3>Update Author Photo</h3>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectImage}
                  className="file-input"
                  disabled={uploading}
                />
                {imageFile && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Selected: {imageFile.name}</div>
                )}
                <button onClick={() => handleUploadImageClick()} disabled={!imageFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload Photo'}
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
