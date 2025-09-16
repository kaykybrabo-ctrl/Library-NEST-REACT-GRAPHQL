import React, { useState, useEffect } from 'react'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { User, Loan } from '../types'
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
  const [profile, setProfile] = useState<User | null>(null)
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

  const buildImageSrc = (path?: string | null) => {
    if (!path) return ''
    // append version even for absolute URLs to avoid stale cache
    if (path.startsWith('http')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    if (path.startsWith('/')) return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`
    // append a version to bust cache/race after uploads
    return `/api/uploads/${path}${imgVersion ? `?v=${imgVersion}` : ''}`
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetchProfile()
    fetchLoans()
    fetchFavoriteBook()
  }, [])

  useEffect(() => {
    if (profile?.description !== undefined) {
      setDescription(profile.description || '')
    }
  }, [profile?.description])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/get-profile')
      setProfile(response.data)
      setError('')
      // nada adicional: render direto usa buildImageSrc + key
    } catch (e) {
      setError('Failed to load profile. Please login again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLoans = async () => {
    if (!user?.username) return

    const response = await api.get(`/api/loans?username=${user.username}`)
    setLoans(response.data)
  }

  const fetchFavoriteBook = async () => {
    if (!user?.username) return

    const response = await api.get(`/api/users/favorite?username=${user.username}`)
    if (response.data) {
      setFavoriteBook(response.data)
    } else {
      setFavoriteBook(null)
    }
  }

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageFile(file)
  }

  const handleUploadImage = async () => {
    if (!imageFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      const resp = await api.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // resp.data já contém o perfil atualizado com profile_image
      if (resp?.data) {
        setProfile(resp.data)
      }
      setImgVersion((v) => v + 1)
      setImageFile(null)
      setError('')
      try { alert('Profile image updated successfully!'); } catch {}
    } catch (e) {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateDescription = async () => {
    setUploading(true)

    const response = await api.post('/api/save-description', {
      description: description
    })

    setProfile(prev => prev ? {
      ...prev,
      description: description
    } : null)
    
    setEditingDescription(false)
    setError('')
    alert('Description updated successfully!')
    setUploading(false)
  }

  const handleReturnBook = async (loanId: number) => {
    const response = await api.post(`/api/return/${loanId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    fetchLoans()
    alert('Book returned successfully!')
    setError('')
  }

  if (loading) {
    return (
      <Layout title="User Profile">
        <div className="loading">Loading profile...</div>
      </Layout>
    )
  }

  return (
    <Layout title="User Profile">
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          My Loans
        </button>
        <button
          className={`tab ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorite')}
        >
          Favorite Book
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2>Profile Information</h2>
            <p><strong>Username:</strong> {user?.username || 'Unknown'}</p>
            <p><strong>Role:</strong> {user?.role || 'User'}</p>

            <div className="profile-image-container">
              <h3>Profile Image</h3>
              <div className="profile-image-display">
                {profile?.profile_image ? (
                  <img
                    src={buildImageSrc(profile.profile_image)}
                    key={`${profile?.profile_image}-${imgVersion}`}
                    alt="Profile"
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
                      e.currentTarget.src = '/api/uploads/default-user.png';
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
                    No profile image uploaded yet
                  </div>
                )}
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Current image src: {buildImageSrc(profile?.profile_image) || '—'}
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3>Description</h3>
              {editingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="description-textarea"
                  />
                  <div>
                    <button onClick={handleUpdateDescription} disabled={uploading}>
                      {uploading ? 'Saving...' : 'Save Description'}
                    </button>
                    <button 
                      onClick={() => {
                        setEditingDescription(false)
                        setDescription(profile?.description || '')
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>{profile?.description || 'No description added yet.'}</p>
                  <button onClick={() => setEditingDescription(true)}>
                    Edit Description
                  </button>
                </div>
              )}
            </div>

            <div className="image-upload">
              <h3>Update Profile Image</h3>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectImage}
                    disabled={uploading}
                  />
                  <button onClick={handleUploadImage} disabled={!imageFile || uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
            </div>
          </section>
        )}

        {activeTab === 'loans' && (
          <section className="profile-section">
            <h2>My Borrowed Books</h2>
            {loans.length === 0 ? (
              <p>You haven't borrowed any books yet.</p>
            ) : (
              <div>
                {loans.map(loan => (
                  <div key={loan.loans_id} className="loan-card">
                    <div>
                      <h4>{loan.title}</h4>
                      <p><strong>Loan Date:</strong> {new Date(loan.loan_date).toLocaleDateString()}</p>
                      {loan.description && <p>{loan.description}</p>}
                    </div>
                    <div>
                      {loan.photo && (
                        <img
                          src={buildImageSrc(loan.photo)}
                          alt={loan.title}
                          className="loan-book-image"
                        />
                      )}
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          handleReturnBook(loan.loans_id)
                        }}
                        className="return-button"
                      >
                        Return Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'favorite' && (
          <section className="profile-section">
            <h2>My Favorite Book</h2>
            {!favoriteBook ? (
              <p>You haven't set a favorite book yet.</p>
            ) : (
              <div className="favorite-book-card">
                {favoriteBook.photo && (
                  <img
                    src={buildImageSrc(favoriteBook.photo)}
                    alt={favoriteBook.title}
                    className="favorite-book-image"
                  />
                )}
                <div>
                  <h3>{favoriteBook.title}</h3>
                  <p><strong>Author:</strong> {favoriteBook.author_name || 'Unknown'}</p>
                  {favoriteBook.description && (
                    <p><strong>Description:</strong> {favoriteBook.description}</p>
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
