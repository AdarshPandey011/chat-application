'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_MESSAGES } from '@/lib/graphql/queries'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { useSocket } from '@/components/SocketProvider'
import { formatDate } from '@/lib/utils'

interface ChatMainProps {
  selectedRoom: string | null
}

export function ChatMain({ selectedRoom }: ChatMainProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const { socket } = useSocket()

  const { data: messagesData, loading, subscribeToMore } = useQuery(GET_MESSAGES, {
    variables: { roomId: selectedRoom, page: 1, limit: 50 },
    skip: !selectedRoom
  })

  const messages = messagesData?.messages?.messages || []

  useEffect(() => {
    if (selectedRoom && socket) {
      // Join the room
      socket.emit('join-room', { roomId: selectedRoom })

      // Listen for new messages
      const handleNewMessage = (message: any) => {
        // This will trigger a refetch of the messages query
        // In a real app, you'd want to update the cache directly
        window.location.reload() // Simple solution for now
      }

      // Listen for typing indicators
      const handleTyping = (data: any) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.username)
          } else {
            newSet.delete(data.username)
          }
          return newSet
        })
      }

      socket.on('new-message', handleNewMessage)
      socket.on('user-typing', handleTyping)

      return () => {
        socket.emit('leave-room', { roomId: selectedRoom })
        socket.off('new-message', handleNewMessage)
        socket.off('user-typing', handleTyping)
      }
    }
  }, [selectedRoom, socket])

  const handleSendMessage = (content: string, type = 'TEXT', fileData?: any) => {
    if (!selectedRoom || !socket) return

    socket.emit('send-message', {
      roomId: selectedRoom,
      content,
      type,
      ...fileData
    })

    // Stop typing indicator
    setIsTyping(false)
    socket.emit('typing', { roomId: selectedRoom, isTyping: false })
  }

  const handleTyping = (text: string) => {
    if (!selectedRoom || !socket) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (text.length > 0 && !isTyping) {
      setIsTyping(true)
      socket.emit('typing', { roomId: selectedRoom, isTyping: true })
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit('typing', { roomId: selectedRoom, isTyping: false })
    }, 1000)
  }

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No chat selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
        {typingUsers.size > 0 && (
          <TypingIndicator typingUsers={Array.from(typingUsers)} />
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  )
}
