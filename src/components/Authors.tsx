import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { Author } from '../types'

const Authors: React.FC = () => {
  const { isAdmin } = useAuth()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [newAuthor, setNewAuthor] = useState({ name: '', biography: '' })
  const [editingAuthor, setEditingAuthor] = useState<number | null>(null)
  const [editData, setEditData] = useState({ name: '' })
  const [error, setError] = useState('')
  const limit = 5
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[Authors] isAdmin =', isAdmin)
    fetchAuthors()
  }, [currentPage])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/authors?page=${currentPage + 1}&limit=${limit}`)
      
      
      if (response.data.authors) {
        setAuthors(response.data.authors)
        setTotalPages(response.data.totalPages || 0)
      } else {
        setAuthors(Array.isArray(response.data) ? response.data : [])
        setTotalPages(1)
      }
    } catch (err) {
      setError('Failed to fetch authors')
      setAuthors([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.name.trim() || !newAuthor.biography.trim()) return

    try {
      await api.post('/api/authors', {
        name_author: newAuthor.name.trim(),
        biography: newAuthor.biography.trim()
      })
      setNewAuthor({ name: '', biography: '' })
      fetchAuthors()
    } catch (err) {
      setError('Failed to create author')
    }
  }

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author.author_id)
    setEditData({ name: author.name_author })
  }

  const handleSaveEdit = async () => {
    if (!editData.name.trim() || !editingAuthor) return

    try {
      console.log('[Authors] Saving edit id=', editingAuthor)
      await api.patch(`/api/authors/${editingAuthor}`, {
        name_author: editData.name.trim()
      })
      alert('Author updated successfully')
      setEditingAuthor(null)
      fetchAuthors()
    } catch (err) {
      console.error('[Authors] Update failed id=', editingAuthor, err)
      setError('Failed to update author')
      alert('Failed to update author')
    }
  }

  const handleCancelEdit = () => {
    setEditingAuthor(null)
    setEditData({ name: '' })
  }

  const handleDeleteAuthor = async (authorId: number) => {
    if (!confirm('Are you sure you want to delete this author?')) return

    try {
      console.log('[Authors] Deleting author id=', authorId)
      await api.delete(`/api/authors/${authorId}`)
      alert('Author deleted successfully')
      fetchAuthors()
    } catch (err) {
      console.error('[Authors] Delete failed id=', authorId, err)
      setError('Failed to delete author')
      alert('Failed to delete author')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Authors">
        <div className="loading">Loading authors...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Authors">
      {error && <div className="error-message">{error}</div>}
      
      {isAdmin && (
        <section className="form-section">
          <h2>Add Author</h2>
          <form onSubmit={handleCreateAuthor}>
            <label htmlFor="author-name">Name:</label>
            <input
              type="text"
              id="author-name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
              required
            />
            
            <label htmlFor="author-biography">Biography:</label>
            <textarea
              id="author-biography"
              value={newAuthor.biography}
              onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
              required
              rows={3}
            />
            
            <button type="submit">Add</button>
          </form>
        </section>
      )}

      <section className="author-list">
        <h2>Authors</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(author => (
              <tr key={author.author_id}>
                <td>{author.author_id}</td>
                <td>
                  {editingAuthor === author.author_id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    author.name_author
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingAuthor === author.author_id ? (
                      <>
                        <button type="button" onClick={handleSaveEdit}>Save</button>
                        <button type="button" onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => navigate(`/authors/${author.author_id}`)}>View</button>
                        {isAdmin && (
                          <>
                            <button type="button" onClick={() => handleEditAuthor(author)}>Edit</button>
                            <button type="button" onClick={() => handleDeleteAuthor(author.author_id)}>Delete</button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={currentPage === i ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default Authors
