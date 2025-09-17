import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from './Layout'
import { Rating, Typography, Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { Book, Review } from '../types'
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
      setError('Please select a valid image file (JPG, PNG, GIF, WebP)')
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
    setUploadStatus('Uploading image...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      console.log('[BookDetail] Uploading image for book', id, 'file=', file?.name)
      const uploadResp = await api.post(`/api/books/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log('[BookDetail] Upload success, refreshing book')
      setBook(prev => {
        if (!prev) return prev
        const respPhoto = uploadResp?.data?.photo
        return { ...prev, photo: respPhoto || prev?.photo || null } as Book
      })
      await fetchBook()
      setImageFile(null)
      setPreviewUrl('')
      setImgVersion(v => v + 1)
      setUploadStatus('Image updated successfully!')
      try { alert('Book image updated successfully!') } catch {}
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to upload image'
      setError(msg)
      console.error('[BookDetail] Upload error:', err?.response || err)
      setUploadStatus(`Error: ${msg}`)
      try { alert(`Error: ${msg}`) } catch {}
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
      setError('Failed to fetch book details')
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
      try { alert('Book image updated successfully!') } catch {}
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to upload image'
      setError(msg)
      try { alert(`Error: ${msg}`) } catch {}
    } finally {
      setUploading(false)
    }
  }

  const handleRentBook = async () => {
    try {
      await api.post(`/api/rent/${id}`)
      alert('Book rented successfully!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to rent book. You may not be logged in or book is already rented.'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleFavoriteBook = async () => {
    try {
      await api.post(`/api/favorite/${id}`)
      alert('Book added to favorites!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add book to favorites'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setError('Please log in to submit a review')
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
      alert('Review submitted successfully!')
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to submit review'
      setError(errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  if (loading) {
    return (
      <Layout title="Book Details">
        <div className="loading">Loading book details...</div>
      </Layout>
    )
  }

  if (!book) {
    return (
      <Layout title="Book Details">
        <div className="error-message">Book not found</div>
        <button onClick={() => navigate('/books')}>Back to Books</button>
      </Layout>
    )
  }

  return (
    <Layout title={`Book: ${book.title}`}>
      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section image-tight">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Back to Books
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author_name || 'Unknown'}</p>
        <p><strong>Description:</strong> {book.description || 'No description available'}</p>

        {previewUrl ? (
          <img src={previewUrl} alt="Selected preview" className="book-image" />
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
          <div className="image-placeholder">No image set yet. Select a file below to upload.</div>
        )}

        {book.photo && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Current image src: <a href={buildImageSrc(book.photo)} target="_blank" rel="noreferrer">{buildImageSrc(book.photo)}</a>
            <div>Raw book.photo: <code>{String(book.photo)}</code></div>
          </div>
        )}
        {!book.photo && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            No image set for this book yet.
          </div>
        )}

        {isAdmin && (
          <div className="image-upload">
            <h3>Update Book Image</h3>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectImage}
                disabled={uploading}
              />
              {imageFile && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Selected: {imageFile.name}</div>
              )}
              <button onClick={handleUploadImageClick} disabled={!imageFile || uploading}>
                {uploading ? 'Uploading...' : 'Update Image'}
              </button>
            </div>
          </div>
        )}
        {uploadStatus && (
          <div style={{ marginTop: 8, fontSize: 12, color: uploadStatus.startsWith('Error') ? '#c00' : '#0a0' }}>
            {uploadStatus}
          </div>
        )}
        <details style={{ marginTop: 12 }}>
          <summary>Debug: Raw book JSON</summary>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#444', background: '#f7f7f7', padding: 8, borderRadius: 4 }}>
            {JSON.stringify(book, null, 2)}
          </pre>
        </details>
      </section>

      <section className="form-section">
        <h3>Book Actions</h3>
        <div className="book-actions">
          <button onClick={handleRentBook}>Rent Book</button>
          <button onClick={handleFavoriteBook}>Add to Favorites</button>
        </div>
      </section>

      <section className="form-section">
        <h3>Write a Review</h3>
        {!currentUser ? (
          <p>Please log in to write a review.</p>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend" sx={{ mb: 1 }}>Rating:</Typography>
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

            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="review-textarea"
            />

            <button type="submit">Submit Review</button>
          </form>
        )}
      </section>

      <section className="form-section">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
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
                  {new Date(review.review_date).toLocaleDateString()}
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
