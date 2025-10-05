'use client'

import { ApolloProvider } from '@apollo/client'
import { createApolloClient } from '@/lib/apollo'
import { AuthProvider } from './AuthProvider'
import { SocketProvider } from './SocketProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const apolloClient = createApolloClient()

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}
