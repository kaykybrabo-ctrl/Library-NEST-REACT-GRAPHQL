import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Book, Author } from '@/types'
import './BooksCards.css'

const Books: React.FC = () => {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [newBook, setNewBook] = useState({ title: '', author_id: '' })
  const [editingBook, setEditingBook] = useState<number | null>(null)
  const [editData, setEditData] = useState({ title: '', author_id: '' })
  const [error, setError] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [featured, setFeatured] = useState<Book[]>([])
  const [carouselItems, setCarouselItems] = useState<Book[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const limit = 6
  const navigate = useNavigate()
  const featuredInitialized = useRef(false)
  const prevFeaturedCount = useRef(0)
  const displayedItems = useMemo(() => (
    carouselItems.length > 0
      ? carouselItems
      : (featured.length > 0 ? featured : books.slice(0, Math.min(8, books.length)))
  ), [carouselItems, featured, books])
  const slidesLength = displayedItems.length

  const capitalizeFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  useEffect(() => {
    fetchAuthors();
    fetchBooks();
    fetchFeatured().catch(() => { })
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery, includeDeleted]);

  useEffect(() => {
    if (slidesLength <= 1) return;
    const id = setTimeout(() => {
      setCurrentSlide((s) => (s + 1) % slidesLength);
    }, 5000);
    return () => clearTimeout(id);
  }, [currentSlide, slidesLength])

  useEffect(() => {
    if (currentSlide >= slidesLength) {
      setCurrentSlide(0)
    }
  }, [slidesLength])

  const fetchFeatured = async () => {
    try {
      const latestResp = await api.get(`/api/books?limit=${9999}&page=1${includeDeleted ? '&includeDeleted=1' : ''}`)
      const list: Book[] = Array.isArray(latestResp.data?.books) ? latestResp.data.books : []
      const sorted = [...list].sort((a: Book, b: Book) => b.book_id - a.book_id)
      if (sorted.length) {
        const next = sorted.slice(0, Math.min(8, sorted.length))
        setFeatured(next)
        setCarouselItems(next)
        if (prevFeaturedCount.current === 0) {
          setCurrentSlide(0)
        }
        prevFeaturedCount.current = next.length
        featuredInitialized.current = true
      }
    } catch { }
  }

  const handleRestoreBook = async (bookId: number) => {
    try {
      await api.patch(`/api/books/${bookId}/restore`)
      alert('Livro restaurado com sucesso')
      await fetchBooks()
      setError('')
    } catch (err) {
      setError('Falha ao restaurar livro')
      alert('Falha ao restaurar livro')
    }
  }

  const fetchBooks = async () => {
    setLoading(true)
    const page = currentPage + 1
    const response = await api.get(`/api/books?limit=${limit}&page=${page}&search=${searchQuery}${includeDeleted ? '&includeDeleted=1' : ''}`)

    if (response.data && Array.isArray(response.data.books)) {
      setBooks(response.data.books)
      setTotalPages(response.data.totalPages)
      if (carouselItems.length === 0) {
        try {
          const allResp = await api.get(`/api/books?limit=${9999}&page=1${includeDeleted ? '&includeDeleted=1' : ''}`)
          const allList: Book[] = Array.isArray(allResp.data?.books) ? allResp.data.books : response.data.books
          const sorted = [...allList].sort((a: Book, b: Book) => b.book_id - a.book_id)
          const next = sorted.slice(0, Math.min(8, sorted.length))
          setFeatured(next)
          setCarouselItems(next)
          if (prevFeaturedCount.current === 0) {
            setCurrentSlide(0)
          }
          prevFeaturedCount.current = next.length
        } catch {
          if (response.data.books.length > 0) {
            const sorted = [...response.data.books].sort((a: Book, b: Book) => b.book_id - a.book_id)
            const next = sorted.slice(0, Math.min(8, sorted.length))
            setFeatured(next)
            setCarouselItems(next)
            if (prevFeaturedCount.current === 0) {
              setCurrentSlide(0)
            }
            prevFeaturedCount.current = next.length
          }
        }
      }
    } else {
      setBooks([])
      setTotalPages(0)
    }
    setLoading(false)
  }

  const fetchAuthors = async () => {
    const response = await api.get('/api/authors?limit=9999&page=1')
    if (response.data && Array.isArray(response.data.authors)) {
      setAuthors(response.data.authors)
    } else {
      setAuthors([])
    }
  }

  const getAuthorName = (authorId: number) => {
    const author = authors.find(a => a.author_id === authorId)
    return author ? author.name_author : ''
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBook.title.trim() || !newBook.author_id) return

    await api.post('/api/books', {
      title: capitalizeFirst(newBook.title.trim()),
      author_id: Number(newBook.author_id)
    })
    setNewBook({ title: '', author_id: '' })
    fetchBooks()
  }

  const handleEditBook = (book: Book) => {
    setEditingBook(book.book_id)
    setEditData({ title: book.title, author_id: book.author_id.toString() })
  }

  const handleSaveEdit = async () => {
    if (!editData.title.trim() || !editData.author_id || !editingBook) return

    const payload = {
      title: capitalizeFirst(editData.title.trim()),
      author_id: Number(editData.author_id)
    }

    await api.patch(`/api/books/${editingBook}`, payload)
    setEditingBook(null)
    setEditData({ title: '', author_id: '' })
    setError('')
    fetchBooks()
  }

  const handleCancelEdit = () => {
    setEditingBook(null)
    setEditData({ title: '', author_id: '' })
  }

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Tem certeza de que deseja excluir este livro?')) return
    try {
      await api.delete(`/api/books/${bookId}`)
      alert('Livro excluído com sucesso')
      await fetchBooks()
      setError('')
    } catch (err) {
      setError('Falha ao excluir livro')
      alert('Falha ao excluir livro')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    fetchBooks()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Layout title="Livros">
        <div className="loading">Carregando livros...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Livros">
      {error && <div className="error-message">{error}</div>}

      <section className="featured-carousel" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Novidades</h2>
        {slidesLength === 0 ? (
          books.length > 0 ? (
            <div style={{ padding: 16, background: '#fff', borderRadius: 10, border: '2px solid #1976d2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {books.slice(0, 8).map((bk) => (
                  <div key={`fallback-${bk.book_id}`} style={{ display: 'flex', gap: 14, alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 10, padding: 12, background: '#fff' }}>
                    <div style={{ width: 70, height: 100, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden', flex: '0 0 auto', alignSelf: 'center' }}>
                      {bk.photo ? (
                        <img src={bk.photo.startsWith('http') || bk.photo.startsWith('/') ? bk.photo : `/api/uploads/${bk.photo}`} alt={bk.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#999', fontSize: 11 }}>Sem imagem</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{bk.title}</div>
                      <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Autor: {getAuthorName(bk.author_id) || 'Desconhecido'}</div>
                      <div style={{ color: '#777', marginTop: 6, fontSize: 12, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 36 }}>
                        {bk.description || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '2px solid #1976d2' }}>
              <div style={{ textAlign: 'center', color: '#666' }}>Sem livros para exibir no carrossel.</div>
            </div>
          )
        ) : (
          <div
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, border: '2px solid #1976d2', background: '#fff', height: 240 }}
          >
            {(() => {
              const bk = displayedItems[currentSlide]
              if (!bk) return null
              return (
                <div key={bk.book_id} style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(calc(-50% + 8px))', padding: '0 72px', background: '#fff' }}>
                  <div onClick={() => navigate(`/books/${bk.book_id}`)}
                    style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 18, width: '100%', maxWidth: 920, cursor: 'pointer', margin: '0 auto' }}>
                    <div style={{ width: 96, height: 136, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {bk.photo ? (
                        <img src={bk.photo.startsWith('http') || bk.photo.startsWith('/') ? bk.photo : `/api/uploads/${bk.photo}`} alt={bk.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#999', fontSize: 12 }}>Sem imagem</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1, maxWidth: 620, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 48 }}>{bk.title}</div>
                      <div style={{ color: '#5a5a5a', fontSize: 13, lineHeight: 1.2 }}>Autor: {getAuthorName(bk.author_id) || 'Desconhecido'}</div>
                      <div style={{ color: '#777', fontSize: 13, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: 56 }}>
                        {bk.description || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {slidesLength > 0 && (
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 64, background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 64, background: 'linear-gradient(270deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 1 }} />
              </>
            )}

            {slidesLength > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Anterior"
                  title="Anterior"
                  onClick={() => setCurrentSlide((s) => (s - 1 + slidesLength) % slidesLength)}
                  style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', background: '#fff', border: '2px solid #1976d2', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                >
                  <span style={{ color: '#1976d2', fontSize: 24, lineHeight: 1 }}>&lt;</span>
                </button>
                <button
                  type="button"
                  aria-label="Próximo"
                  title="Próximo"
                  onClick={() => setCurrentSlide((s) => (s + 1) % slidesLength)}
                  style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: '#fff', border: '2px solid #1976d2', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                >
                  <span style={{ color: '#1976d2', fontSize: 24, lineHeight: 1 }}>&gt;</span>
                </button>

                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {displayedItems.map((_, i) => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === currentSlide ? '#333' : '#bbb' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
      </section>

      {isAdmin && (
        <section className="form-section">
          <h2>Adicionar Livro</h2>
          <form onSubmit={handleCreateBook}>
            <label htmlFor="author-select">Autor:</label>
            <select
              id="author-select"
              value={newBook.author_id}
              onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
              required
            >
              <option value="">Selecione um autor</option>
              {authors.map(author => (
                <option key={author.author_id} value={author.author_id}>
                  {author.name_author}
                </option>
              ))}
            </select>

            <label htmlFor="book-title">Título:</label>
            <input
              type="text"
              id="book-title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />

            <button type="submit">Adicionar</button>
          </form>
        </section>
      )}

      <section className="search-section">
        <h2>Buscar Livros</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título"
          />
          <button
            type="submit"
            aria-label="Buscar"
            title="Buscar"
            className="icon-button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" fill="currentColor" />
            </svg>
          </button>
          {isAdmin && (
            <label style={{ marginLeft: 12, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => { setIncludeDeleted(e.target.checked); setCurrentPage(0); }}
              />
              Mostrar excluídos
            </label>
          )}
        </form>
      </section>

      {books.length === 0 && searchQuery ? (
        <div className="no-results">Nenhum resultado encontrado para sua busca.</div>
      ) : (
        <section className="book-list">
          <h2>Livros</h2>
          
          <div className={`books-grid ${loading ? 'loading' : ''}`}>
            {books.map(book => (
              <div 
                key={book.book_id} 
                className={`book-card ${book.deleted_at ? 'deleted' : ''} ${editingBook === book.book_id ? 'editing' : ''}`}
              >
                <div className="book-card-image">
                  {book.photo ? (
                    <img 
                      src={book.photo.startsWith('http') || book.photo.startsWith('/') ? book.photo : `/api/uploads/${book.photo}`} 
                      alt={book.title}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.no-image')) {
                          const noImageDiv = document.createElement('div');
                          noImageDiv.className = 'no-image';
                          noImageDiv.textContent = 'Sem imagem';
                          parent.appendChild(noImageDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      Sem imagem
                    </div>
                  )}
                </div>
                
                <div className="book-card-content">
                  {editingBook === book.book_id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="Título do livro"
                      />
                      <select
                        value={editData.author_id}
                        onChange={(e) => setEditData({ ...editData, author_id: e.target.value })}
                      >
                        {authors.map(author => (
                          <option key={author.author_id} value={author.author_id}>
                            {author.name_author}
                          </option>
                        ))}
                      </select>
                      <div className="edit-actions">
                        <button className="save-btn" onClick={handleSaveEdit}>Salvar</button>
                        <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="book-card-title" title={book.title}>{book.title}</h3>
                      <p className="book-card-author">por {getAuthorName(book.author_id) || 'Autor desconhecido'}</p>
                      <p className="book-card-description">
                        {book.description || 'Sem descrição disponível para este livro.'}
                      </p>
                      
                      <div className="book-card-meta">
                        <span>ID: {book.book_id}</span>
                        {book.deleted_at && <span style={{color: '#ff9800', fontWeight: 'bold'}}>EXCLUÍDO</span>}
                      </div>
                      
                      <div className="book-card-actions">
                        <button
                          type="button"
                          onClick={() => navigate(`/books/${book.book_id}`)}
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
                              onClick={() => handleEditBook(book)}
                              aria-label="Editar"
                              title="Editar"
                              className="icon-button"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z" fill="currentColor" />
                              </svg>
                            </button>
                            
                            {book.deleted_at ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreBook(book.book_id)}
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
                                onClick={() => handleDeleteBook(book.book_id)}
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
      )}
    </Layout>
  )
}

export default Books
