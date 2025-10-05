'use client'

import { formatFileSize } from '@/lib/utils'

// Message interface - matches the data structure from our API
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

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
}

// Component to render individual chat messages
export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  // Render different content based on message type
  const renderMessageContent = () => {
    switch (message.type) {
      case 'TEXT':
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )
      
      // Handle image messages
      case 'IMAGE':
        return (
          <div>
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg"
            />
            {message.content && (
              <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>
        )
      
      // Handle file attachments
      case 'FILE':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.fileName}
              </p>
              {message.fileSize && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <a
                href={message.fileUrl}
                download={message.fileName}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        )
      
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )
    }
  }

  return (
    <div
      className={`px-4 py-2 rounded-2xl ${
        isOwnMessage
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      {renderMessageContent()}
    </div>
  )
}
