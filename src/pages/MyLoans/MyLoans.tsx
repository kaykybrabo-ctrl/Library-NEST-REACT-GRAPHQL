import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import './MyLoans.css'

interface Loan {
  loans_id: number
  loan_date: string
  due_date: string
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
  const [loans, setLoans] = useState<Loan[]>([])
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOverdueModal, setShowOverdueModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchMyLoans()
      checkOverdueLoans()
    }
  }, [user])

  const fetchMyLoans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/loans')
      setLoans(response.data)
      setError('')
    } catch (err: any) {
      setError('Erro ao carregar seus empréstimos')
      console.error('Erro ao carregar empréstimos:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkOverdueLoans = async () => {
    try {
      const response = await api.get('/api/loans/overdue')
      setOverdueLoans(response.data)
      if (response.data.length > 0) {
        setShowOverdueModal(true)
      }
    } catch (err: any) {
      console.error('Erro ao verificar empréstimos em atraso:', err)
    }
  }

  const handleReturnBook = async (loanId: number, bookTitle: string) => {
    if (!confirm(`Tem certeza de que deseja devolver o livro "${bookTitle}"?`)) {
      return
    }

    try {
      const response = await api.post(`/api/return/${loanId}`)
      setSuccessMessage(`Livro "${bookTitle}" devolvido com sucesso! 🎉`)
      setTimeout(() => setSuccessMessage(''), 5000)
      fetchMyLoans()
      checkOverdueLoans()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao devolver livro'
      setError(errorMsg)
      setTimeout(() => setError(''), 5000)
      console.error('Erro ao devolver livro:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDaysRemainingText = (daysRemaining: number, isOverdue: boolean) => {
    if (isOverdue) {
      return `Atrasado há ${Math.abs(daysRemaining)} dias`
    } else if (daysRemaining === 0) {
      return 'Vence hoje!'
    } else if (daysRemaining === 1) {
      return 'Vence amanhã'
    } else {
      return `${daysRemaining} dias restantes`
    }
  }

  const getDaysRemainingClass = (daysRemaining: number, isOverdue: boolean) => {
    if (isOverdue) return 'overdue'
    if (daysRemaining <= 1) return 'urgent'
    if (daysRemaining <= 3) return 'warning'
    return 'normal'
  }

  const getDueDateBadgeText = (loan: Loan) => {
    if (loan.is_overdue) {
      return `⚠️ Vencido`
    } else if (loan.days_remaining === 0) {
      return '🔥 Vence Hoje'
    } else if (loan.days_remaining === 1) {
      return '⏰ Vence Amanhã'
    } else {
      return `📅 ${loan.days_remaining}d`
    }
  }

  if (loading) {
    return (
      <Layout title="Meus Empréstimos">
        <div className="loading">Carregando seus empréstimos...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Meus Empréstimos">
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Modal de Cobrança */}
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
        ) : (
          <div className="loans-grid">
            {loans.map(loan => (
              <div key={loan.loans_id} className={`loan-card ${loan.is_overdue ? 'overdue-card' : ''}`}>
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
                    
                    <button
                      type="button"
                      onClick={() => handleReturnBook(loan.loans_id, loan.title)}
                      className="btn-primary"
                    >
                      Devolver Livro
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

export default MyLoans
