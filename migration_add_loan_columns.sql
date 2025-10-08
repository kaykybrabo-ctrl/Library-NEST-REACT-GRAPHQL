ALTER TABLE loans 
ADD COLUMN due_date DATETIME NULL,
ADD COLUMN returned_at DATETIME NULL,
ADD COLUMN is_overdue BOOLEAN DEFAULT FALSE,
ADD COLUMN fine_amount DECIMAL(10,2) DEFAULT 0.00;

UPDATE loans 
SET due_date = DATE_ADD(loan_date, INTERVAL 7 DAY)
WHERE due_date IS NULL;

UPDATE loans 
SET is_overdue = TRUE 
WHERE due_date < NOW() AND returned_at IS NULL;

DESCRIBE loans;

SELECT * FROM loans;
