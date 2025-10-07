import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Author } from '@/types'
import './AuthorsCards.css'

const Authors: React.FC = () => {
  const { isAdmin } = useAuth()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [newAuthor, setNewAuthor] = useState({ name: '', biography: '' })
  const [editingAuthor, setEditingAuthor] = useState<number | null>(null)
  const [editData, setEditData] = useState({ name: '', biography: '' })
  const [error, setError] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const limit = 6
  const navigate = useNavigate()

  const capitalizeFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  useEffect(() => {
    fetchAuthors()
  }, [currentPage, includeDeleted])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/authors?page=${currentPage + 1}&limit=${limit}${includeDeleted ? '&includeDeleted=1' : ''}`)
      
      
      if (response.data.authors) {
        setAuthors(response.data.authors)
        setTotalPages(response.data.totalPages || 0)
      } else {
        setAuthors(Array.isArray(response.data) ? response.data : [])
        setTotalPages(1)
      }
    } catch (err) {
      setError('Falha ao buscar autores')
      setAuthors([])
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreAuthor = async (authorId: number) => {
    try {
      await api.patch(`/api/authors/${authorId}/restore`)
      alert('Autor restaurado com sucesso')
      fetchAuthors()
    } catch (err) {
      setError('Falha ao restaurar autor')
      alert('Falha ao restaurar autor')
    }
  }

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuthor.name.trim() || !newAuthor.biography.trim()) return

    try {
      await api.post('/api/authors', {
        name_author: capitalizeFirst(newAuthor.name.trim()),
        biography: capitalizeFirst(newAuthor.biography.trim())
      })
      setNewAuthor({ name: '', biography: '' })
      fetchAuthors()
    } catch (err) {
      setError('Falha ao criar autor')
    }
  }

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author.author_id)
    setEditData({ name: author.name_author, biography: author.biography || '' })
  }

  const handleSaveEdit = async () => {
    if (!editData.name.trim() || !editingAuthor) return

    try {
      await api.patch(`/api/authors/${editingAuthor}`, {
        name_author: capitalizeFirst(editData.name.trim()),
        biography: editData.biography.trim() || null
      })
      alert('Autor atualizado com sucesso')
      setEditingAuthor(null)
      setEditData({ name: '', biography: '' })
      fetchAuthors()
    } catch (err) {
      setError('Falha ao atualizar autor')
      alert('Falha ao atualizar autor')
    }
  }

  const handleCancelEdit = () => {
    setEditingAuthor(null)
    setEditData({ name: '', biography: '' })
  }

  const handleDeleteAuthor = async (authorId: number) => {
    if (!confirm('Tem certeza de que deseja excluir este autor?')) return

    try {
      await api.delete(`/api/authors/${authorId}`)
      alert('Autor excluído com sucesso')
      fetchAuthors()
    } catch (err) {
      setError('Falha ao excluir autor')
      alert('Falha ao excluir autor')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Autores">
        <div className="loading">Carregando autores...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Autores">
      {error && <div className="error-message">{error}</div>}
      
      {isAdmin && (
        <section className="form-section">
          <h2>Adicionar Autor</h2>
          <form onSubmit={handleCreateAuthor}>
            <label htmlFor="author-name">Nome:</label>
            <input
              type="text"
              id="author-name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
              required
            />
            
            <label htmlFor="author-biography">Biografia:</label>
            <textarea
              id="author-biography"
              value={newAuthor.biography}
              onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
              required
              rows={3}
            />
            
            <button type="submit">Adicionar</button>
          </form>
        </section>
      )}

      <section className="author-list">
        <h2>Autores ({authors.length} {authors.length === 1 ? 'autor' : 'autores'})</h2>
        {isAdmin && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => { setIncludeDeleted(e.target.checked); setCurrentPage(0); }}
              />
              Mostrar excluídos
            </label>
          </div>
        )}
        
        <div className={`authors-grid ${loading ? 'loading' : ''}`}>
          {authors.map(author => (
            <div 
              key={author.author_id} 
              className={`author-card ${author.deleted_at ? 'deleted' : ''} ${editingAuthor === author.author_id ? 'editing' : ''}`}
            >
              {author.deleted_at && <div className="deleted-badge">Excluído</div>}
              
              <div className="author-card-header">
                <div className="author-card-avatar">
                  {author.photo && author.photo.trim() !== '' ? (
                    <img 
                      src={author.photo.startsWith('http') || author.photo.startsWith('/') ? author.photo : `/api/uploads/${author.photo}`} 
                      alt={author.name_author}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'avatar-fallback';
                          fallbackDiv.textContent = author.name_author.charAt(0).toUpperCase();
                          parent.appendChild(fallbackDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {author.name_author.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="author-card-name">{author.name_author}</h3>
              </div>
              
              <div className="author-card-content">
                {editingAuthor === author.author_id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Nome do autor"
                    />
                    <textarea
                      value={editData.biography}
                      onChange={(e) => setEditData({ ...editData, biography: e.target.value })}
                      placeholder="Biografia do autor"
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSaveEdit}>Salvar</button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="author-card-biography">
                      {author.biography || 'Sem biografia disponível para este autor.'}
                    </p>
                    
                    <div className="author-card-meta">
                      <span>ID: {author.author_id}</span>
                      {author.deleted_at && <span style={{color: '#ff9800', fontWeight: 'bold'}}>EXCLUÍDO</span>}
                    </div>
                    
                    <div className="author-card-actions">
                      <button
                        type="button"
                        onClick={() => navigate(`/authors/${author.author_id}`)}
                        aria-label="Ver detalhes"
                        title="Ver detalhes"
                        className="icon-button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" />
                        </svg>
                      </button>
                      
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditAuthor(author)}
                            aria-label="Editar"
                            title="Editar"
                            className="icon-button"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z" fill="currentColor" />
                            </svg>
                          </button>
                          
                          {author.deleted_at ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreAuthor(author.author_id)}
                              aria-label="Restaurar"
                              title="Restaurar"
                              className="icon-button"
                              style={{borderColor: '#4caf50', color: '#4caf50'}}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5v2a5 5 0 1 1-4.9 6h2.02A3 3 0 1 0 12 9v2l4-3-4-3Z" fill="currentColor" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteAuthor(author.author_id)}
                              aria-label="Excluir"
                              title="Excluir"
                              className="icon-button"
                              style={{borderColor: '#f44336', color: '#f44336'}}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z" fill="currentColor" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

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
