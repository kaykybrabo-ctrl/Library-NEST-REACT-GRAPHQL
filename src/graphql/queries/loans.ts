import { gql } from '@apollo/client';

export const RENT_BOOK_MUTATION = gql`
  mutation RentBook($bookId: Int!) {
    rentBook(bookId: $bookId) {
      loans_id
      loan_date
      due_date
      book_id
      title
      photo
      description
    }
  }
`;

export const RETURN_BOOK_MUTATION = gql`
  mutation ReturnBook($loanId: Int!) {
    returnBook(loanId: $loanId)
  }
`;

export const MY_LOANS_QUERY = gql`
  query MyLoans {
    myLoans {
      loans_id
      loan_date
      due_date
      book_id
      title
      photo
      description
      is_overdue
      days_remaining
      hours_remaining
      time_remaining
      fine_amount
    }
  }
`;

export const ALL_LOANS_QUERY = gql`
  query AllLoans {
    allLoans {
      loans_id
      loan_date
      due_date
      book_id
      title
      photo
      description
      username
      user_id
    }
  }
`;

export const BOOK_LOAN_STATUS_QUERY = gql`
  query BookLoanStatus($bookId: Int!) {
    bookLoanStatus(bookId: $bookId) {
      isRented
      loan {
        loans_id
        username
        user_id
        loan_date
        due_date
      }
    }
  }
`;

export const MY_BOOK_LOAN_QUERY = gql`
  query MyBookLoan($bookId: Int!) {
    myBookLoan(bookId: $bookId) {
      hasLoan
      loan {
        loans_id
        loan_date
        due_date
        is_overdue
        days_remaining
        hours_remaining
        time_remaining
        fine_amount
      }
    }
  }
`;

export const OVERDUE_LOANS_QUERY = gql`
  query OverdueLoans {
    overdueLoans {
      loans_id
      due_date
      fine_amount
      title
    }
  }
`;
