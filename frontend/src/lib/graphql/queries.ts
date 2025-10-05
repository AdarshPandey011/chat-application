import { gql } from '@apollo/client'

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      description
      type
      avatar
      createdAt
      updatedAt
      members {
        id
        role
        user {
          id
          username
          avatar
        }
      }
      messages(limit: 1) {
        id
        content
        createdAt
        user {
          id
          username
        }
      }
    }
  }
`

export const GET_ROOM = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      name
      description
      type
      avatar
      createdAt
      updatedAt
      creator {
        id
        username
        avatar
      }
      members {
        id
        role
        joinedAt
        user {
          id
          username
          avatar
          firstName
          lastName
        }
      }
    }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($roomId: ID!, $page: Int, $limit: Int) {
    messages(roomId: $roomId, page: $page, limit: $limit) {
      messages {
        id
        content
        type
        fileUrl
        fileName
        fileSize
        createdAt
        updatedAt
        user {
          id
          username
          avatar
        }
      }
      pagination {
        page
        limit
        total
        pages
      }
    }
  }
`

export const GET_USERS = gql`
  query GetUsers($search: String, $limit: Int) {
    users(search: $search, limit: $limit) {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`

export const SEARCH_USERS = gql`
  query SearchUsers($search: String!) {
    users(search: $search) {
      id
      username
      firstName
      lastName
      avatar
    }
  }
`

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomInput!) {
    createRoom(input: $input) {
      id
      name
      description
      type
      avatar
      createdAt
      members {
        id
        role
        user {
          id
          username
          avatar
        }
      }
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      type
      fileUrl
      fileName
      fileSize
      createdAt
      user {
        id
        username
        avatar
      }
    }
  }
`

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: ID!, $input: UpdateMessageInput!) {
    updateMessage(id: $id, input: $input) {
      id
      content
      updatedAt
    }
  }
`

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`
