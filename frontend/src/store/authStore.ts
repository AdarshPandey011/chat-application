import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'

// User interface - matches what we get from the API
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Auth state interface
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => void
  updateProfile: (data: Partial<User>) => void
  fetchUser: () => Promise<void>
}

// Registration form data
interface RegisterData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      // Handle user login
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Make GraphQL request to login endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    token
                    user {
                      id
                      email
                      username
                      firstName
                      lastName
                      avatar
                      createdAt
                      updatedAt
                    }
                  }
                }
              `,
              variables: {
                input: { email, password }
              }
            })
          })

          const { data, errors } = await response.json()

          if (errors) {
            throw new Error(errors[0].message)
          }

          if (data.login) {
            // Store user data and token
            set({ 
              user: data.login.user, 
              token: data.login.token,
              isLoading: false 
            })
            localStorage.setItem('token', data.login.token)
            toast.success('Logged in successfully!')
          }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error instanceof Error ? error.message : 'Login failed')
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                mutation Register($input: RegisterInput!) {
                  register(input: $input) {
                    token
                    user {
                      id
                      email
                      username
                      firstName
                      lastName
                      avatar
                      createdAt
                      updatedAt
                    }
                  }
                }
              `,
              variables: { input: data }
            })
          })

          const { data: result, errors } = await response.json()

          if (errors) {
            throw new Error(errors[0].message)
          }

          if (result.register) {
            set({ 
              user: result.register.user, 
              token: result.register.token,
              isLoading: false 
            })
            localStorage.setItem('token', result.register.token)
            toast.success('Account created successfully!')
          }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error instanceof Error ? error.message : 'Registration failed')
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem('token')
        toast.success('Logged out successfully!')
      },

      // Check if user is authenticated on app load
      checkAuth: () => {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const decoded = jwtDecode<{ id: string; exp: number }>(token)
            // Check if token is still valid
            if (decoded.exp * 1000 > Date.now()) {
              set({ token })
              // Fetch user data
              get().fetchUser()
            } else {
              // Token expired, remove it
              localStorage.removeItem('token')
            }
          } catch (error) {
            // Invalid token, remove it
            localStorage.removeItem('token')
          }
        }
      },

      // Fetch current user data from API
      fetchUser: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().token}`
            },
            body: JSON.stringify({
              query: `
                query Me {
                  me {
                    id
                    email
                    username
                    firstName
                    lastName
                    avatar
                    createdAt
                    updatedAt
                  }
                }
              `
            })
          })

          const { data, errors } = await response.json()

          if (!errors && data.me) {
            set({ user: data.me })
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
      },

      // Update user profile locally
      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...data }
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
)
