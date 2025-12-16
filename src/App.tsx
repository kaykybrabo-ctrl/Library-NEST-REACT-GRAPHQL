import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home';
import Login from './components/Login'
import Register from './components/Register'
import Books from '@/pages/Books/Books'
import Authors from '@/pages/Authors/Authors'
import BookDetail from '@/pages/Books/BookDetail'
import AuthorDetail from '@/pages/Authors/AuthorDetail'
import UserProfile from '@/pages/User/UserProfile'
import Users from '@/pages/Users/Users'
import Loans from '@/pages/Loans/Loans'
import MyLoans from '@/pages/MyLoans/MyLoans'
import ResetPassword from './components/ResetPassword'
import PublicBookDetail from './components/public/PublicBookDetail'
import PublicAuthorDetail from './components/public/PublicAuthorDetail'
import PublicBooks from './components/public/PublicBooks'
import PublicAuthors from './components/public/PublicAuthors'

const HomeGate: React.FC = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/books" replace /> : <Home />
}

function AppContent() {
  return (
    <Routes>
        <Route path="/" element={<HomeGate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />
        
        <Route path="/public/books" element={<PublicBooks />} />
        <Route path="/public/books/:id" element={<PublicBookDetail />} />
        <Route path="/public/authors" element={<PublicAuthors />} />
        <Route path="/public/authors/:id" element={<PublicAuthorDetail />} />
        
        <Route path="/books" element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        } />
        <Route path="/authors" element={
          <ProtectedRoute>
            <Authors />
          </ProtectedRoute>
        } />
        <Route path="/books/:id" element={
          <ProtectedRoute>
            <BookDetail />
          </ProtectedRoute>
        } />
        <Route path="/authors/:id" element={
          <ProtectedRoute>
            <AuthorDetail />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/loans" element={
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        } />
        <Route path="/my-loans" element={
          <ProtectedRoute>
            <MyLoans />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
