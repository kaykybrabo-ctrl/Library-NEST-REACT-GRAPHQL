import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils'
import './PublicAuthorDetail.css'

interface Author {
  author_id: number;
  name_author: string;
  biography?: string;
  photo?: string;
}

interface Book {
  book_id: number;
  title: string;
  description?: string;
  photo?: string;
  author_id: number;
}

const PublicAuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [author, setAuthor] = useState<Author | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Biografias hardcoded para autores específicos
  const biografias = {
    1: "Guilherme Biondo é um escritor contemporâneo brasileiro conhecido por suas obras que exploram temas profundos da condição humana. Nascido em São Paulo, desenvolveu desde cedo uma paixão pela literatura e pela filosofia. Suas obras são caracterizadas por uma prosa elegante e reflexiva, que convida o leitor a questionar aspectos fundamentais da existência. Com formação em Letras pela USP, Biondo tem se destacado no cenário literário nacional por sua capacidade de criar narrativas envolventes que combinam elementos do realismo contemporâneo com toques de introspecção psicológica.",
    2: "Manoel Leite é um renomado autor brasileiro especializado em ficção histórica e romance. Natural do Nordeste, suas obras frequentemente retratam a rica cultura e as tradições de sua região natal. Com mais de duas décadas de carreira literária, Leite é reconhecido por sua habilidade em entrelaçar fatos históricos com narrativas ficcionais cativantes. Formado em História pela UFPE, ele utiliza seu conhecimento acadêmico para criar obras que não apenas entretêm, mas também educam os leitores sobre aspectos importantes da cultura brasileira. Seus livros já foram traduzidos para diversos idiomas e receberam vários prêmios literários nacionais."
  }

  useEffect(() => {
    if (id) {
      fetchAuthor()
      fetchAuthorBooks()
    }
  }, [id])

  const fetchAuthor = async () => {
    try {
      const response = await axios.get(`/api/authors/${id}`)
      setAuthor(response.data)
      setLoading(false)
    } catch (err) {
      setError('Falha ao carregar detalhes do autor')
      setLoading(false)
    }
  }

  const fetchAuthorBooks = async () => {
    try {
      const response = await axios.get(`/api/books?author_id=${id}&limit=1000`)
      setBooks(response.data.books || response.data)
    } catch (err) {
      // Silently handle error for public viewing
      setBooks([])
    }
  }

  const getBiografia = (authorId: number) => {
    return biografias[authorId as keyof typeof biografias] || 
           author?.biography || 
           'Biografia não disponível no momento.'
  }

  if (loading) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate('/')}>
              <span className="logo">📚</span>
              <h1 className="title">Library NEST</h1>
            </div>
            <div className="nav-links">
              <button onClick={() => navigate('/')} className="nav-link">Início</button>
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="loading">Carregando detalhes do autor...</div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="public-layout">
        <div className="public-header">
          <div className="public-nav">
            <div className="brand" onClick={() => navigate('/')}>
              <span className="logo">📚</span>
              <h1 className="title">Library NEST</h1>
            </div>
            <div className="nav-links">
              <button onClick={() => navigate('/')} className="nav-link">Início</button>
              <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
            </div>
          </div>
        </div>
        <div className="error-message">Autor não encontrado</div>
        <button onClick={() => navigate('/')}>Voltar ao Início</button>
      </div>
    )
  }

  return (
    <div className="public-layout">
      <div className="public-header">
        <div className="public-nav">
          <div className="brand" onClick={() => navigate('/')}>
            <span className="logo">📚</span>
            <h1 className="title">Library NEST</h1>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Início</button>
            <button onClick={() => navigate('/login')} className="login-btn">Entrar</button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <section className="profile-section">
        <button onClick={() => navigate('/')} className="back-button">
          ← Voltar ao Início
        </button>
        
        <div className="author-header">
          <div className="author-image-container">
            <img 
              src={getImageUrl(author.photo, 'profile')} 
              alt={author.name_author}
              className="author-image-enhanced"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImageUrl('profile')
              }}
            />
          </div>
          <div className="author-info">
            <h2>{author.name_author}</h2>
            <p className="author-title">Autor</p>
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Biografia</h3>
        <div className="biography-content">
          <p>{getBiografia(author.author_id)}</p>
        </div>
      </section>

      <section className="form-section">
        <h3>Livros do Autor ({books.length})</h3>
        {books.length === 0 ? (
          <p>Nenhum livro encontrado para este autor.</p>
        ) : (
          <div className="books-grid">
            {books.map(book => (
              <div 
                key={book.book_id} 
                className="book-card clickable"
                onClick={() => navigate(`/public/books/${book.book_id}`)}
              >
                <div className="book-image-container">
                  <img 
                    src={getImageUrl(book.photo, 'book')} 
                    alt={book.title}
                    className="book-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImageUrl('book')
                    }}
                  />
                </div>
                <div className="book-info">
                  <h4 className="book-title">{book.title}</h4>
                  <p className="book-description">
                    {book.description ? 
                      (book.description.length > 100 ? 
                        book.description.substring(0, 100) + '...' : 
                        book.description
                      ) : 
                      'Descrição não disponível'
                    }
                  </p>
                  <button className="view-book-btn">
                    📖 Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {books.length > 0 && (
        <section className="form-section">
          <h3>Lista Completa de Livros</h3>
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.book_id}>
                    <td className="book-title-cell">
                      <strong>{book.title}</strong>
                    </td>
                    <td className="book-description-cell">
                      {book.description ? 
                        (book.description.length > 80 ? 
                          book.description.substring(0, 80) + '...' : 
                          book.description
                        ) : 
                        'Descrição não disponível'
                      }
                    </td>
                    <td className="book-actions-cell">
                      <button 
                        onClick={() => navigate(`/public/books/${book.book_id}`)}
                        className="table-action-btn"
                      >
                        📖 Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default PublicAuthorDetail
