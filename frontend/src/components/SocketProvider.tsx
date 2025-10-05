'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002', {
        auth: {
          token
        },
        transports: ['websocket']
      })

      newSocket.on('connect', () => {
        console.log('Connected to chat server')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user, token])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
