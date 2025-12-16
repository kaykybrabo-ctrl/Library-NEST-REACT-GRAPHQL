import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const hasToken = typeof localStorage !== 'undefined' && localStorage.getItem('token')

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
