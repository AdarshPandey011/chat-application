'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useQuery } from '@apollo/client'
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { GET_ROOM } from '@/lib/graphql/queries'
import { getInitials } from '@/lib/utils'

interface ChatHeaderProps {
  selectedRoom: string | null
  onMenuClick: () => void
}

export function ChatHeader({ selectedRoom, onMenuClick }: ChatHeaderProps) {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: roomData } = useQuery(GET_ROOM, {
    variables: { id: selectedRoom },
    skip: !selectedRoom
  })

  const room = roomData?.room

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {room ? (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {room.avatar ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={room.avatar}
                  alt={room.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {room.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{room.name}</h1>
              {room.type === 'GROUP' && (
                <p className="text-sm text-gray-500">
                  {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-gray-900">ChatApp</h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <BellIcon className="h-6 w-6" />
        </button>

        {/* User menu */}
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-md text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar}
                    alt={user.username}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getInitials(user?.firstName, user?.lastName, user?.username)}
                    </span>
                  </div>
                )}
              </div>
              <span className="hidden md:block font-medium text-gray-900">
                {user?.firstName || user?.username}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Your profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  )
}
