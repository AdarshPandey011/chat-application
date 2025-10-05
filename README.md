# ChatApp - Realtime Chat Application

A modern, scalable realtime chat application built with React, Node.js, GraphQL, Socket.IO, Kafka, and OAuth authentication. Features microservices architecture, AI-powered text suggestions, and comprehensive file sharing capabilities.

## 🚀 Features

- **Real-time Messaging**: WebSocket-based chat with Socket.IO for instant message delivery
- **OAuth Authentication**: Secure authentication with Google OAuth and JWT tokens
- **GraphQL API**: Flexible and efficient data access with Apollo Server
- **Microservices Architecture**: Scalable backend with separate services for auth, chat, and notifications
- **Event-Driven Communication**: Kafka integration for reliable message processing and notifications
- **AI Text Suggestions**: TensorFlow.js integration with DistilGPT-2 for predictive text
- **File Sharing**: Support for images and documents with drag-and-drop interface
- **Modern UI**: Beautiful, responsive interface built with React, Next.js, and Tailwind CSS
- **Push Notifications**: Real-time notifications via Firebase and email/SMS
- **Docker Support**: Containerized deployment with Docker Compose

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (Next.js)     │◄──►│   (GraphQL)     │◄──►│   (OAuth/JWT)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        │
                       ┌─────────────────┐               │
                       │  Chat Service   │               │
                       │  (Socket.IO)    │               │
                       └─────────────────┘               │
                                │                        │
                                ▼                        │
                       ┌─────────────────┐               │
                       │   Kafka         │               │
                       │   (Events)      │               │
                       └─────────────────┘               │
                                │                        │
                                ▼                        │
                       ┌─────────────────┐               │
                       │Notification Svc │               │
                       │(Push/Email/SMS) │               │
                       └─────────────────┘               │
                                │                        │
                                └────────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Next.js 14
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL
- **Socket.IO Client** for real-time communication
- **TensorFlow.js** for AI text suggestions
- **React Hook Form** with Zod validation
- **Framer Motion** for animations

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST APIs
- **Apollo Server** for GraphQL
- **Socket.IO** for WebSocket communication
- **Kafka** for event streaming
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **Passport.js** for OAuth

### Infrastructure
- **Docker** and Docker Compose
- **PostgreSQL** database
- **Redis** for session management
- **Kafka** for message streaming

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chatapp
```

### 2. Environment Setup
Create environment files for each service:

**Auth Service** (`services/auth-service/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
PORT=3001
NODE_ENV="development"
```

**Chat Service** (`services/chat-service/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
PORT=3002
NODE_ENV="development"
```

**API Gateway** (`services/api-gateway/.env`):
```env
AUTH_SERVICE_URL="http://localhost:3001"
CHAT_SERVICE_URL="http://localhost:3002"
KAFKA_BROKERS="localhost:9092"
PORT=4000
NODE_ENV="development"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:3002"
```

### 3. Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Manual Setup (Alternative)
```bash
# Install dependencies for all services
npm run install:all

# Start database services
docker-compose up -d postgres redis kafka zookeeper

# Run database migrations
cd services/auth-service
npm run prisma:migrate

# Start all services
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Auth Service**: http://localhost:3001
- **Chat Service**: http://localhost:3002

## 📱 Usage

### Authentication
1. Register a new account or sign in with Google OAuth
2. Complete your profile setup
3. Start chatting!

### Creating Chats
1. Click the "+" button in the sidebar
2. Choose between Group or Direct chat
3. Add members and start the conversation

### AI Text Suggestions
- Start typing a message
- AI suggestions will appear above the input field
- Click on suggestions to use them

### File Sharing
- Drag and drop files into the chat input
- Or click the attachment button to select files
- Supports images, documents, and more

## 🔧 Development

### Project Structure
```
chatapp/
├── frontend/                 # Next.js React application
├── services/
│   ├── auth-service/         # Authentication microservice
│   ├── chat-service/         # Chat and messaging microservice
│   ├── api-gateway/          # GraphQL API gateway
│   └── notification-service/ # Event processing and notifications
├── docker-compose.yml        # Docker orchestration
└── README.md
```

### Available Scripts
```bash
# Development
npm run dev                  # Start all services in development
npm run dev:frontend         # Start only frontend
npm run dev:backend          # Start only backend services

# Building
npm run build                # Build all services
npm run build:frontend       # Build only frontend
npm run build:backend        # Build only backend

# Docker
npm run docker:up            # Start with Docker Compose
npm run docker:down          # Stop Docker Compose
```

### Database Management
```bash
# Generate Prisma client
cd services/auth-service
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🚀 Deployment

### Production Environment Variables
Set up the following environment variables for production:

- Database connection strings
- JWT secrets
- OAuth credentials
- Kafka broker URLs
- Email/SMS service credentials
- Firebase service account keys

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** for AI model integration
- **Apollo GraphQL** for excellent developer experience
- **Socket.IO** for real-time communication
- **Tailwind CSS** for beautiful styling
- **Prisma** for database management

## 📞 Support

For support, email support@chatapp.com or join our Slack channel.

---

Built with ❤️ using modern web technologies
