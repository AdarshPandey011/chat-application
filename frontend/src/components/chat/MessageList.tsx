'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { MessageBubble } from './MessageBubble'
import { formatDate, getInitials } from '@/lib/utils'

interface Message {
  id: string
  content: string
  type: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  user: {
    id: string
    username: string
    avatar?: string
  }
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start the conversation by sending a message.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.user.id === user?.id
        const showAvatar = index === 0 || messages[index - 1].user.id !== message.user.id
        const showDate = index === 0 || 
          new Date(message.createdAt).toDateString() !== 
          new Date(messages[index - 1].createdAt).toDateString()

        return (
          <div key={message.id}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} space-x-2`}>
              {!isOwnMessage && (
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    message.user.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={message.user.avatar}
                        alt={message.user.username}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {getInitials(undefined, undefined, message.user.username)}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="h-8 w-8" />
                  )}
                </div>
              )}

              <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {!isOwnMessage && showAvatar && (
                  <span className="text-xs text-gray-500 mb-1">
                    {message.user.username}
                  </span>
                )}
                
                <MessageBubble message={message} isOwnMessage={isOwnMessage} />
                
                <span className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                  {formatDate(message.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
