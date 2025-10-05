import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import toast from 'react-hot-toast'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
})

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      toast.error(message)
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    } else {
      toast.error('Network error occurred')
    }
  }
})

export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            rooms: {
              merge(existing = [], incoming) {
                return incoming
              }
            },
            messages: {
              merge(existing = [], incoming) {
                return incoming
              }
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all'
      },
      query: {
        errorPolicy: 'all'
      }
    }
  })
}
