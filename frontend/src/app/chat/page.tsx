'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatMain } from '@/components/chat/ChatMain'
import { ChatHeader } from '@/components/chat/ChatHeader'

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:flex-shrink-0 lg:w-80 xl:w-96`}>
        <ChatSidebar
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          selectedRoom={selectedRoom}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <ChatMain selectedRoom={selectedRoom} />
      </div>
    </div>
  )
}
