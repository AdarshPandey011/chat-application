'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { XMarkIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { GET_ROOMS, SEARCH_USERS } from '@/lib/graphql/queries'
import { formatDate } from '@/lib/utils'
import { CreateRoomModal } from './CreateRoomModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ChatSidebarProps {
  selectedRoom: string | null
  onRoomSelect: (roomId: string) => void
  onClose: () => void
}

export function ChatSidebar({ selectedRoom, onRoomSelect, onClose }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useQuery(GET_ROOMS)

  const rooms = roomsData?.rooms || []

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            title="New chat"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto">
        {roomsLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats yet</p>
            <p className="text-sm mt-1">Start a conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {rooms
              .filter((room: any) =>
                room.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom === room.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {room.avatar ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={room.avatar}
                          alt={room.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-lg font-medium text-white">
                            {room.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {room.name}
                        </p>
                        {room.messages?.[0] && (
                          <p className="text-xs text-gray-500">
                            {formatDate(room.messages[0].createdAt)}
                          </p>
                        )}
                      </div>
                      {room.messages?.[0] && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.messages[0].user.username}: {room.messages[0].content}
                        </p>
                      )}
                      {room.type === 'GROUP' && (
                        <p className="text-xs text-gray-400">
                          {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={() => {
            setShowCreateRoom(false)
            refetchRooms()
          }}
        />
      )}
    </div>
  )
}
