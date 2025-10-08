-- Migração para adicionar colunas necessárias à tabela loans
-- Execute este script no banco de dados para corrigir o sistema de empréstimos

-- USE library1; -- Ajuste o nome do banco conforme necessário

-- Adicionar colunas necessárias à tabela loans
ALTER TABLE loans 
ADD COLUMN due_date DATETIME NULL,
ADD COLUMN returned_at DATETIME NULL,
ADD COLUMN is_overdue BOOLEAN DEFAULT FALSE,
ADD COLUMN fine_amount DECIMAL(10,2) DEFAULT 0.00;

-- Atualizar empréstimos existentes com data de vencimento (7 dias após loan_date)
UPDATE loans 
SET due_date = DATE_ADD(loan_date, INTERVAL 7 DAY)
WHERE due_date IS NULL;

-- Verificar se há empréstimos vencidos e atualizar is_overdue
UPDATE loans 
SET is_overdue = TRUE 
WHERE due_date < NOW() AND returned_at IS NULL;

-- Mostrar estrutura atualizada da tabela
DESCRIBE loans;

-- Mostrar dados atualizados
SELECT * FROM loans;
