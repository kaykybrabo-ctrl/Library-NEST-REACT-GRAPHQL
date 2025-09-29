import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Book, Author } from '@/types'

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
  const limit = 5
  const navigate = useNavigate()

  const capitalizeFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (authors.length > 0) {
      fetchBooks();
    }
  }, [currentPage, searchQuery, authors, includeDeleted]);

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
    } else {
      setBooks([])
      setTotalPages(0)
    }
    setLoading(false)
  }

  const fetchAuthors = async () => {
    const response = await api.get('/api/authors?limit=9999&page=1')
    if (response.data && Array.isArray(response.data.authors)) {
      setAuthors(response.data.authors);
    } else {
      setAuthors([]);
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
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" fill="currentColor"/>
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
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>ID</th>
                <th style={{ textAlign: 'center' }}>ID do Autor</th>
                <th style={{ textAlign: 'center' }}>Autor</th>
                <th style={{ textAlign: 'center' }}>Título</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.book_id}>
                  <td style={{ textAlign: 'center' }}>{book.book_id}</td>
                  <td style={{ textAlign: 'center' }}>{book.author_id}</td>
                  <td style={{ textAlign: 'center' }}>
                    {editingBook === book.book_id ? (
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
                    ) : (
                      getAuthorName(book.author_id)
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editingBook === book.book_id ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    ) : (
                      book.title
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons">
                      {editingBook === book.book_id ? (
                        <>
                          <button onClick={handleSaveEdit}>Salvar</button>
                          <button onClick={handleCancelEdit}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate(`/books/${book.book_id}`)}
                            aria-label="Ver"
                            title="Ver"
                            className="icon-button"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor"/>
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z" fill="currentColor"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBook(book.book_id)}
                                aria-label="Excluir"
                                title="Excluir"
                                className="icon-button"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z" fill="currentColor"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRestoreBook(book.book_id)}
                                aria-label="Restaurar"
                                title="Restaurar"
                                className="icon-button"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 5v2a5 5 0 1 1-4.9 6h2.02A3 3 0 1 0 12 9v2l4-3-4-3Z" fill="currentColor"/>
                                </svg>
                              </button>
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
      )}
    </Layout>
  )
}

export default Books
