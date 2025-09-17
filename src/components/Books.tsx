import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Layout from './Layout'
import { useAuth } from '../contexts/AuthContext'
import { Book, Author } from '../types'

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
  const limit = 5
  const navigate = useNavigate()

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (authors.length > 0) {
      fetchBooks();
    }
  }, [currentPage, searchQuery, authors]);

  const fetchBooks = async () => {
    setLoading(true)
    const page = currentPage + 1
    const response = await api.get(`/api/books?limit=${limit}&page=${page}&search=${searchQuery}`)

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
      title: newBook.title.trim(),
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
      title: editData.title.trim(),
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
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      await api.delete(`/api/books/${bookId}`)
      alert('Book deleted successfully')
      await fetchBooks()
      setError('')
    } catch (err) {
      setError('Failed to delete book')
      alert('Failed to delete book')
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
      <Layout title="Books">
        <div className="loading">Loading books...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Books">
      {error && <div className="error-message">{error}</div>}
      
      {isAdmin && (
        <section className="form-section">
          <h2>Add Book</h2>
          <form onSubmit={handleCreateBook}>
            <label htmlFor="author-select">Author:</label>
            <select
              id="author-select"
              value={newBook.author_id}
              onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
              required
            >
              <option value="">Select an Author</option>
              {authors.map(author => (
                <option key={author.author_id} value={author.author_id}>
                  {author.name_author}
                </option>
              ))}
            </select>
            
            <label htmlFor="book-title">Title:</label>
            <input
              type="text"
              id="book-title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />
            
            <button type="submit">Add</button>
          </form>
        </section>
      )}

      <section className="search-section">
        <h2>Search Books</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      {books.length === 0 && searchQuery ? (
        <div className="no-results">No results found for your search.</div>
      ) : (
        <section className="book-list">
          <h2>Books</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Author ID</th>
                <th>Name</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.author_id}</td>
                  <td>
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
                  <td>
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
                  <td>
                    <div className="action-buttons">
                      {editingBook === book.book_id ? (
                        <>
                          <button onClick={handleSaveEdit}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => navigate(`/books/${book.book_id}`)}>View</button>
                          {isAdmin && (
                            <>
                              <button type="button" onClick={() => handleEditBook(book)}>Edit</button>
                              <button type="button" onClick={() => handleDeleteBook(book.book_id)}>Delete</button>
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
              <p>Total Pages: {totalPages} | Current Page: {currentPage + 1}</p>
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
