import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date
  scalar Upload

  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Room {
    id: ID!
    name: String!
    description: String
    type: RoomType!
    avatar: String
    createdAt: Date!
    updatedAt: Date!
    creator: User!
    members: [RoomMember!]!
    messages: [Message!]!
    messageCount: Int!
  }

  type RoomMember {
    id: ID!
    user: User!
    role: Role!
    joinedAt: Date!
  }

  type Message {
    id: ID!
    content: String!
    type: MessageType!
    fileUrl: String
    fileName: String
    fileSize: Int
    createdAt: Date!
    updatedAt: Date!
    user: User!
    room: Room!
  }

  enum RoomType {
    DIRECT
    GROUP
  }

  enum Role {
    ADMIN
    MODERATOR
    MEMBER
  }

  enum MessageType {
    TEXT
    IMAGE
    FILE
    SYSTEM
  }

  input CreateRoomInput {
    name: String!
    description: String
    type: RoomType = GROUP
    memberIds: [ID!]!
  }

  input UpdateRoomInput {
    name: String
    description: String
    avatar: String
  }

  input CreateMessageInput {
    content: String!
    type: MessageType = TEXT
    fileUrl: String
    fileName: String
    fileSize: Int
    roomId: ID!
  }

  input UpdateMessageInput {
    content: String!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    firstName: String
    lastName: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    username: String
    firstName: String
    lastName: String
    avatar: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PaginatedMessages {
    messages: [Message!]!
    pagination: PaginationInfo!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type Query {
    # User queries
    me: User
    users(search: String, limit: Int = 10): [User!]!
    user(id: ID!): User

    # Room queries
    rooms: [Room!]!
    room(id: ID!): Room

    # Message queries
    messages(roomId: ID!, page: Int = 1, limit: Int = 50): PaginatedMessages!
    message(id: ID!): Message
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!

    # Room mutations
    createRoom(input: CreateRoomInput!): Room!
    updateRoom(id: ID!, input: UpdateRoomInput!): Room!
    addRoomMember(roomId: ID!, userId: ID!): Room!
    removeRoomMember(roomId: ID!, userId: ID!): Boolean!

    # Message mutations
    createMessage(input: CreateMessageInput!): Message!
    updateMessage(id: ID!, input: UpdateMessageInput!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  type Subscription {
    messageAdded(roomId: ID!): Message!
    roomUpdated(roomId: ID!): Room!
    userTyping(roomId: ID!): TypingEvent!
  }

  type TypingEvent {
    userId: ID!
    username: String!
    isTyping: Boolean!
  }
`;
