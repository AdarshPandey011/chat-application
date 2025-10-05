'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline'
import { CREATE_ROOM, SEARCH_USERS } from '@/lib/graphql/queries'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreateRoomModalProps {
  onClose: () => void
  onRoomCreated: () => void
}

export function CreateRoomModal({ onClose, onRoomCreated }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [roomType, setRoomType] = useState<'DIRECT' | 'GROUP'>('GROUP')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM)

  const { data: usersData } = useQuery(SEARCH_USERS, {
    variables: { search: searchQuery },
    skip: !searchQuery || searchQuery.length < 2
  })

  const users = usersData?.users || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!roomName.trim() || selectedMembers.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createRoom({
        variables: {
          input: {
            name: roomName,
            description: roomDescription || undefined,
            type: roomType,
            memberIds: selectedMembers
          }
        }
      })
      
      toast.success('Room created successfully!')
      onRoomCreated()
    } catch (error) {
      toast.error('Failed to create room')
      console.error('Create room error:', error)
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create New Chat
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Room type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chat Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="GROUP"
                          checked={roomType === 'GROUP'}
                          onChange={(e) => setRoomType(e.target.value as 'GROUP')}
                          className="mr-2"
                        />
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-1" />
                        Group
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="DIRECT"
                          checked={roomType === 'DIRECT'}
                          onChange={(e) => setRoomType(e.target.value as 'DIRECT')}
                          className="mr-2"
                        />
                        <UserIcon className="h-5 w-5 text-gray-400 mr-1" />
                        Direct
                      </label>
                    </div>
                  </div>

                  {/* Room name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chat Name *
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="input"
                      placeholder="Enter chat name"
                      required
                    />
                  </div>

                  {/* Room description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                      className="input"
                      placeholder="Enter description (optional)"
                      rows={2}
                    />
                  </div>

                  {/* Member search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Members *
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input mb-2"
                      placeholder="Search users..."
                    />

                    {/* Selected members */}
                    {selectedMembers.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {selectedMembers.map(memberId => {
                            const user = users.find((u: any) => u.id === memberId)
                            return user ? (
                              <div
                                key={memberId}
                                className="flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                              >
                                <span>{user.username}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleMember(memberId)}
                                  className="text-primary-600 hover:text-primary-800"
                                >
                                  ×
                                </button>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}

                    {/* User search results */}
                    {searchQuery.length >= 2 && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                        {users.map((user: any) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleMember(user.id)}
                            className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 ${
                              selectedMembers.includes(user.id) ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {user.avatar ? (
                                <img
                                  className="h-8 w-8 rounded-full"
                                  src={user.avatar}
                                  alt={user.username}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-700">
                                    {getInitials(user.firstName, user.lastName, user.username)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username
                                }
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{user.username}
                              </p>
                            </div>
                            {selectedMembers.includes(user.id) && (
                              <div className="flex-shrink-0">
                                <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !roomName.trim() || selectedMembers.length === 0}
                      className="btn-primary"
                    >
                      {creating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Create Chat'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
