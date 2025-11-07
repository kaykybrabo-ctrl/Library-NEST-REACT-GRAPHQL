import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_LOANS_QUERY, RETURN_BOOK_MUTATION } from '@/graphql/queries/loans'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import './LoansCards.css'

interface Loan {
  loans_id: number
  loan_date: string
  book_id: number
  title: string
  photo: string | null
  description: string | null
  user_id: number
  username: string
}

const Loans: React.FC = () => {
  const { isAdmin, user } = useAuth()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { data: loansData, loading, refetch, error: queryError } = useQuery(ALL_LOANS_QUERY, {
    skip: !isAdmin,
    fetchPolicy: 'cache-and-network'
  })

  const [returnBookMutation] = useMutation(RETURN_BOOK_MUTATION)

  const loans = loansData?.allLoans || []

  const handleReturnBook = async (loanId: number) => {
    if (!confirm('Tem certeza de que deseja cancelar este empréstimo?')) {
      return
    }

    try {
      await returnBookMutation({
        variables: { loanId: Number(loanId) }
      })
      alert('Empréstimo cancelado com sucesso')
      refetch()
    } catch (err: any) {
      alert('Erro ao cancelar empréstimo: ' + (err.message || 'Erro desconhecido'))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAdmin) {
    return (
      <Layout title="Empréstimos">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 style={{ color: '#333', marginBottom: '16px' }}>Acesso Restrito</h2>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.5' }}>
            Esta página é exclusiva para administradores. Apenas administradores podem visualizar e gerenciar todos os empréstimos da biblioteca.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '16px' }}>
            Para ver seus próprios empréstimos, acesse a aba "Meus Empréstimos".
          </p>
          <button
            onClick={() => navigate('/my-loans')}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '24px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
            }}
          >
            Ver Meus Empréstimos
          </button>
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout title="Gerenciar Empréstimos">
        <div className="loading">Carregando empréstimos...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Gerenciar Empréstimos">
      {error && <div className="error-message">{error}</div>}

      <section className="loans-section">
        <div className="section-header">
          <h2>Empréstimos Ativos ({loans.length})</h2>
          <p>Gerencie todos os empréstimos de livros da biblioteca</p>
        </div>

        {loans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-content">
              <h3>Nenhum empréstimo ativo</h3>
              <p>Não há livros alugados no momento.</p>
            </div>
          </div>
        ) : (
          <div className="loans-grid">
            {loans.map(loan => (
              <div key={loan.loans_id} className="loan-card">
                <div className="loan-card-image">
                  {loan.photo ? (
                    <img 
                      src={loan.photo.startsWith('http') || loan.photo.startsWith('/') ? loan.photo : `/api/uploads/${loan.photo}`} 
                      alt={loan.title}
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
                
                <div className="loan-card-content">
                  <h3 className="loan-card-title" title={loan.title}>{loan.title}</h3>
                  <p className="loan-card-user">
                    <strong>Usuário:</strong> {loan.username}
                  </p>
                  <p className="loan-card-date">
                    <strong>Alugado em:</strong> {formatDate(loan.loan_date)}
                  </p>
                  <p className="loan-card-description">
                    {loan.description || 'Sem descrição disponível para este livro.'}
                  </p>
                  
                  <div className="loan-card-meta">
                    <span>ID do Livro: {loan.book_id}</span>
                    <span>ID do Usuário: {loan.user_id}</span>
                  </div>
                  
                  <div className="loan-card-actions">
                    <button
                      type="button"
                      onClick={() => navigate(`/books/${loan.book_id}`)}
                      aria-label="Ver detalhes do livro"
                      title="Ver detalhes do livro"
                      className="icon-button view-button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" />
                      </svg>
                      Ver Livro
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleReturnBook(loan.loans_id)}
                      aria-label="Cancelar empréstimo"
                      title="Cancelar empréstimo"
                      className="icon-button cancel-button"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" fill="currentColor" />
                      </svg>
                      Cancelar Empréstimo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

export default Loans
