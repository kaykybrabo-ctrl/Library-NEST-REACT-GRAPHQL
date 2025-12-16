import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useApolloClient } from '@apollo/client'
import { RETURN_BOOK_MUTATION, MY_LOANS_QUERY, OVERDUE_LOANS_QUERY, RENEW_LOAN_MUTATION } from '@/graphql/queries/loans'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/utils/imageUtils'
import './MyLoans.css'

interface LoanData {
  loans_id: number
  loan_date: string
  due_date: string
  returned_at?: string | null
  book_id: number
  title: string
  photo: string | null
  description: string | null
  is_overdue: boolean
  days_remaining: number
  hours_remaining: number
  time_remaining: string
  fine_amount: number
}

interface OverdueLoan {
  loans_id: number
  book_title: string
  fine_amount: number
  due_date: string
}

const MyLoans: React.FC = () => {
  const { user } = useAuth()
  const apolloClient = useApolloClient()
  const [error, setError] = useState('')
  const [showOverdueModal, setShowOverdueModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned' | 'overdue'>('active')
  const navigate = useNavigate()

  const { data: loansData, loading, refetch: refetchLoans } = useQuery(MY_LOANS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !user,
  })

  const { data: overdueData, refetch: refetchOverdue } = useQuery(OVERDUE_LOANS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !user,
  })

  const loans = loansData?.myLoans || []
  const overdueLoans = overdueData?.overdueLoans || []

  useEffect(() => {
    if (user && overdueLoans.length > 0) {
      setShowOverdueModal(true)
    }
  }, [user, overdueLoans])

  const [returnBookMutation] = useMutation(RETURN_BOOK_MUTATION)
  const [renewLoanMutation] = useMutation(RENEW_LOAN_MUTATION)

  const handleReturnBook = async (loanId: number, bookTitle: string) => {
    if (!confirm(`Tem certeza de que deseja devolver o livro "${bookTitle}"?`)) {
      return
    }

    try {
      await returnBookMutation({
        variables: { loanId: Number(loanId) },
        refetchQueries: [
          { query: MY_LOANS_QUERY }
        ]
      })
      
      await apolloClient.resetStore()
      setSuccessMessage(`Livro "${bookTitle}" devolvido com sucesso! 🎉`)
      setTimeout(() => setSuccessMessage(''), 5000)
      
      setTimeout(async () => {
        await refetchLoans()
        await refetchOverdue()
      }, 100)
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao devolver livro'
      setError(errorMsg)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleRenewLoan = async (loanId: number, bookTitle: string) => {
    if (!confirm(`Deseja renovar o empréstimo de "${bookTitle}" por mais 7 dias?`)) {
      return
    }

    try {
      await renewLoanMutation({
        variables: { loanId: Number(loanId) },
        refetchQueries: [
          { query: MY_LOANS_QUERY }
        ]
      })

      await apolloClient.resetStore()
      setSuccessMessage(`Empréstimo de "${bookTitle}" renovado com sucesso! 🎉`)
      setTimeout(() => setSuccessMessage(''), 5000)

      setTimeout(async () => {
        await refetchLoans()
        await refetchOverdue()
      }, 100)
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao renovar empréstimo'
      setError(errorMsg)
      setTimeout(() => setError(''), 5000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDaysRemainingText = (loan: any) => {
    const { days_remaining, hours_remaining, is_overdue } = loan;
    
    if (is_overdue) {
      return `Atrasado há ${Math.abs(days_remaining)} dias`
    } else if (days_remaining === 0) {
      const hoursLeft = hours_remaining % 24;
      if (hoursLeft <= 0) {
        return 'Vence hoje!'
      } else {
        return `Vence hoje! (${hoursLeft}h restantes)`
      }
    } else if (days_remaining === 1) {
      const hoursLeft = hours_remaining % 24;
      return `Vence amanhã (${hoursLeft}h restantes)`
    } else {
      const hoursLeft = hours_remaining % 24;
      return `${days_remaining} dias e ${hoursLeft}h restantes`
    }
  }

  const getDaysRemainingClass = (daysRemaining: number, isOverdue: boolean) => {
    if (isOverdue) return 'overdue'
    if (daysRemaining <= 1) return 'urgent'
    if (daysRemaining <= 3) return 'warning'
    return 'normal'
  }

  const getDueDateBadgeText = (loan: LoanData) => {
    if (loan.is_overdue) {
      return `⚠️ Vencido`
    } else if (loan.days_remaining === 0) {
      return '🔥 Vence Hoje'
    } else if (loan.days_remaining === 1) {
      return '⏰ Vence Amanhã'
    } else {
      const totalHours = Math.floor(loan.hours_remaining);
      let remainingHours = totalHours - (loan.days_remaining * 24);
      let adjustedDays = loan.days_remaining;
      
      if (remainingHours >= 24) {
        adjustedDays += Math.floor(remainingHours / 24);
      }
      
      return `📅 ${adjustedDays}d`
    }
  }

  const getFilteredLoans = () => {
    if (filterStatus === 'all') return loans

    const getLoanStatus = (loan: LoanData): 'active' | 'returned' | 'overdue' => {
      if (loan.returned_at) return 'returned'
      if (loan.is_overdue) return 'overdue'
      return 'active'
    }

    return loans.filter((loan: LoanData) => getLoanStatus(loan) === filterStatus)
  }

  if (loading) {
    return (
      <Layout title="Meus Empréstimos">
        <div className="loading">Carregando seus empréstimos...</div>
      </Layout>
    )
  }

  const filteredLoans = getFilteredLoans()

  const getLoanStatus = (loan: LoanData): 'active' | 'returned' | 'overdue' => {
    if (loan.returned_at) return 'returned'
    if (loan.is_overdue) return 'overdue'
    return 'active'
  }

  const activeCount = loans.filter((loan: LoanData) => getLoanStatus(loan) === 'active').length
  const returnedCount = loans.filter((loan: LoanData) => getLoanStatus(loan) === 'returned').length
  const overdueCount = loans.filter((loan: LoanData) => getLoanStatus(loan) === 'overdue').length

  return (
    <Layout title="Meus Empréstimos">
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFilterStatus('active')}
          style={{ padding: '10px 20px', backgroundColor: filterStatus === 'active' ? '#162c74' : '#e0e0e0', color: filterStatus === 'active' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Ativos ({activeCount})
        </button>
        <button 
          onClick={() => setFilterStatus('overdue')}
          style={{ padding: '10px 20px', backgroundColor: filterStatus === 'overdue' ? '#162c74' : '#e0e0e0', color: filterStatus === 'overdue' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Atrasados ({overdueCount})
        </button>
        <button 
          onClick={() => setFilterStatus('returned')}
          style={{ padding: '10px 20px', backgroundColor: filterStatus === 'returned' ? '#162c74' : '#e0e0e0', color: filterStatus === 'returned' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Histórico ({returnedCount})
        </button>
        <button 
          onClick={() => setFilterStatus('all')}
          style={{ padding: '10px 20px', backgroundColor: filterStatus === 'all' ? '#162c74' : '#e0e0e0', color: filterStatus === 'all' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Todos ({loans.length})
        </button>
      </div>

      {showOverdueModal && overdueLoans.length > 0 && (
        <div className="modal-overlay">
          <div className="overdue-modal">
            <div className="modal-header">
              <h2>⚠️ Empréstimos em Atraso</h2>
            </div>
            <div className="modal-content">
              <p>Você possui livros em atraso. Por favor, devolva-os o quanto antes.</p>
              <div className="overdue-list">
                {overdueLoans.map((loan) => (
                  <div key={loan.loans_id} className="overdue-item">
                    <strong>{loan.book_title}</strong>
                    <span>Vencimento: {formatDate(loan.due_date)}</span>
                    <span className="overdue-status">⚠️ Vencido</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowOverdueModal(false)}
                className="btn-primary"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="my-loans-section">
        <div className="section-header">
          <h2>Meus Empréstimos ({loans.length})</h2>
          <p>Gerencie seus livros alugados e fique atento aos prazos</p>
        </div>

        {loans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-content">
              <h3>Nenhum empréstimo ativo</h3>
              <p>Você não possui livros alugados no momento.</p>
              <button 
                onClick={() => navigate('/books')}
                className="btn-primary"
              >
                Explorar Livros
              </button>
            </div>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="no-loans">
            <div className="no-loans-content">
              <h3>Nenhum empréstimo encontrado</h3>
              <p>Nenhum empréstimo corresponde ao filtro selecionado.</p>
            </div>
          </div>
        ) : (
          <div className="loans-grid">
            {filteredLoans.map(loan => (
              <div key={loan.loans_id} className={`loan-card ${loan.is_overdue ? 'overdue-card' : ''}`}>
                <div className="loan-card-image">
                  <img 
                    src={getImageUrl(loan.photo, 'book', false, loan.title)} 
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
                </div>
                
                <div className="loan-card-content">
                  <div className="loan-card-header">
                    <div className="loan-card-title-wrapper">
                      <h3 className="loan-card-title" title={loan.title}>{loan.title}</h3>
                    </div>
                    <div className={`due-date-badge ${getDaysRemainingClass(loan.days_remaining, loan.is_overdue)}`}>
                      {getDueDateBadgeText(loan)}
                    </div>
                  </div>
                  
                  <div className="loan-dates">
                    <p className="loan-date">
                      <strong>Alugado em:</strong> {formatDate(loan.loan_date)}
                    </p>
                    <p className="due-date">
                      <strong>Vencimento:</strong> {formatDate(loan.due_date)}
                    </p>
                  </div>

                  <div className={`time-remaining ${loan.is_overdue ? 'overdue' : 'active'}`}>
                    <span className="timer-icon">⏰</span>
                    <strong>{loan.time_remaining}</strong>
                    {!loan.is_overdue && <span className="remaining-text"> restantes</span>}
                  </div>

                  {loan.is_overdue && loan.fine_amount > 0 && (
                    <div className="fine-info">
                      💰 Multa: R$ {Number(loan.fine_amount).toFixed(2)}
                    </div>
                  )}

                  <p className="loan-card-description">
                    {loan.description || 'Sem descrição disponível para este livro.'}
                  </p>
                  
                  <div className="loan-card-actions">
                    <button
                      type="button"
                      onClick={() => navigate(`/books/${loan.book_id}`)}
                      className="btn-secondary"
                    >
                      Ver Detalhes
                    </button>
                    {getLoanStatus(loan) === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleRenewLoan(Number(loan.loans_id), loan.title)}
                        className="btn-primary"
                      >
                        Renovar Empréstimo
                      </button>
                    )}
                    {!loan.returned_at && (
                      <button
                        type="button"
                        onClick={() => handleReturnBook(Number(loan.loans_id), loan.title)}
                        className="btn-primary"
                      >
                        Devolver Livro
                      </button>
                    )}
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

export default MyLoans
