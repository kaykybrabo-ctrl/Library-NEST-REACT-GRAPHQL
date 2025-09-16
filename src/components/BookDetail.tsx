import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
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
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (id) {
      fetchBook()
      fetchReviews()
      checkAuthStatus()
    }
  }, [id])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/user/me', {
        withCredentials: true
      })
      setCurrentUser(response.data)
    } catch {
      setCurrentUser(null)
    }
  }

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`)
      setBook(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch book details')
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews')
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
      await axios.post(`/api/books/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchBook()
      setImageFile(null)
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRentBook = async () => {
    try {
      await axios.post(`/api/rent/${id}`, {}, {
        withCredentials: true
      })
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
      await axios.post(`/api/favorite/${id}`, {}, {
        withCredentials: true
      })
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
      await axios.post('/api/reviews', {
        book_id: Number(id),
        user_id: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment
      }, {
        withCredentials: true
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
      
      <section className="profile-section">
        <button onClick={() => navigate('/books')} className="back-button">
          ← Back to Books
        </button>
        
        <h2>{book.title}</h2>
        <p><strong>Author:</strong> {book.author_name || 'Unknown'}</p>
        <p><strong>Description:</strong> {book.description || 'No description available'}</p>
        
        {book.photo && (
          <img 
            src={book.photo.startsWith('http') ? book.photo : `/api/uploads/${book.photo}`} 
            alt={book.title}
            className="book-image"
          />
        )}

        {isAdmin && (
          <div className="image-upload">
            <h3>Update Book Image</h3>
            <form onSubmit={handleImageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
              />
              <button type="submit" disabled={!imageFile || uploading}>
                {uploading ? 'Uploading...' : 'Update Image'}
              </button>
            </form>
          </div>
        )}
      </section>
    </Layout>
  )
}

export default BookDetail
