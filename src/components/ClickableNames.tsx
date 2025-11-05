import React from 'react'
import { useNavigate } from 'react-router-dom'

interface ClickableAuthorProps {
  authorId: number
  authorName: string
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent) => void
}

interface ClickableUserProps {
  username: string
  displayName?: string
  className?: string
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent) => void
}

export const ClickableAuthor: React.FC<ClickableAuthorProps> = ({
  authorId,
  authorName,
  className = 'clickable-author',
  style,
  onClick
}) => {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    } else {
      navigate(`/authors/${authorId}`)
    }
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer', ...style }}
    >
      {authorName}
    </span>
  )
}

export const ClickableUser: React.FC<ClickableUserProps> = ({
  username,
  displayName,
  className = 'clickable-user',
  style,
  onClick
}) => {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    } else {
      const profileUsername = username.includes('@') ? username : `${username}@gmail.com`
      navigate(`/profile/${profileUsername}`)
    }
  }

  const getName = () => {
    if (displayName && displayName.trim()) {
      return displayName
    }
    if (username.includes('@')) {
      return username.split('@')[0]
    }
    return username
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      style={{ cursor: 'pointer', ...style }}
    >
      {getName()}
    </span>
  )
}
