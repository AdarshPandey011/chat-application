# 💬 ChatApp - Real-time Chat Application

A modern, scalable real-time chat application built with microservices architecture, featuring React frontend, Node.js backend, GraphQL APIs, and real-time messaging capabilities.

![ChatApp Preview](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=ChatApp+Real-time+Chat+Application)

## 🚀 Features

### Frontend Features
- **Modern React UI** with Next.js 14 and TypeScript
- **Real-time messaging** with Socket.IO
- **Responsive design** with Tailwind CSS
- **OAuth authentication** (Google, GitHub)
- **File sharing** (images, documents)
- **AI-powered text suggestions** using TensorFlow.js
- **Dark/Light theme** support
- **Message reactions** and typing indicators
- **Demo mode** for testing without backend

### Backend Features
- **Microservices architecture** (Auth, Chat, API Gateway, Notifications)
- **GraphQL API** with Apollo Server
- **Real-time communication** with Socket.IO
- **Event-driven architecture** with Kafka
- **JWT authentication** with Passport.js
- **Database** with Prisma ORM and PostgreSQL
- **Caching** with Redis
- **File upload** handling
- **Email notifications**

### DevOps & Deployment
- **Docker containerization**
- **Docker Compose** for development
- **Nginx reverse proxy**
- **Environment-based configuration**
- **Health checks** and monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (Next.js)     │◄──►│   (GraphQL)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │  Chat Service   │             │
         │              │   (Socket.IO)   │             │
         │              └─────────────────┘             │
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │ Notification    │             │
         │              │    Service      │             │
         │              └─────────────────┘             │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │    │   PostgreSQL    │    │     Kafka       │
│   (Caching)     │    │   (Database)    │    │   (Messaging)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Apollo Client** - GraphQL client
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **TensorFlow.js** - AI text suggestions
- **React Hook Form** - Form handling
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **GraphQL** - API query language
- **Apollo Server** - GraphQL server
- **Socket.IO** - Real-time communication
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Kafka** - Event streaming
- **Passport.js** - Authentication
- **JWT** - Token-based auth

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/AdarshPandey011/chat-application.git
cd chat-application
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Copy the environment example files:
```bash
cp env.example .env
cp services/auth-service/env.example services/auth-service/.env
```

### 4. Start with Docker (Recommended)
```bash
docker-compose up -d
```

### 5. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:auth        # Auth service on http://localhost:3001
npm run dev:chat        # Chat service on http://localhost:3002
npm run dev:api         # API Gateway on http://localhost:4000
```

## 🧪 Testing

### Demo Mode (No Backend Required)
1. Go to http://localhost:3000/auth/login
2. Click "Try Demo Mode"
3. Click "Login as Demo User"
4. Explore the chat interface!

### Manual Testing
```bash
# Run comprehensive tests
./test-everything.sh

# Run specific tests
./test.sh
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📱 Usage

### Authentication
- **Register**: Create a new account with email/username
- **Login**: Sign in with credentials
- **OAuth**: Login with Google/GitHub
- **Demo Mode**: Test without registration

### Chat Features
- **Create Rooms**: Start group conversations
- **Direct Messages**: Private 1-on-1 chats
- **File Sharing**: Upload images and documents
- **Real-time**: Instant message delivery
- **Typing Indicators**: See when others are typing
- **AI Suggestions**: Get smart text completions

### User Management
- **Profile**: Update avatar and information
- **Settings**: Customize preferences
- **Notifications**: Manage alert preferences

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

#### Auth Service
```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Chat Service
```env
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
```

### Database Setup
```bash
# Generate Prisma client
cd services/auth-service
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale chat-service=3
```

### Manual Deployment
```bash
# Build frontend
npm run build:frontend

# Build backend services
npm run build:backend

# Start production servers
npm run start
```

## 🧪 Development

### Project Structure
```
chatapp/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and configurations
│   │   └── store/           # State management
├── services/                 # Microservices
│   ├── auth-service/        # Authentication service
│   ├── chat-service/        # Chat and messaging service
│   ├── api-gateway/         # GraphQL API gateway
│   └── notification-service/ # Email/push notifications
├── docker-compose.yml       # Development containers
├── docker-compose.prod.yml  # Production containers
└── nginx.conf              # Reverse proxy configuration
```

### Adding New Features
1. **Frontend**: Add components in `frontend/src/components/`
2. **API**: Define GraphQL schemas in `services/api-gateway/`
3. **Services**: Implement business logic in respective services
4. **Database**: Update Prisma schema and run migrations

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and Node.js
- **Prettier**: Code formatting
- **Comments**: Human-readable, natural language

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Use conventional commit format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Next.js Team** - For the production-ready React framework
- **Apollo GraphQL** - For the GraphQL tools
- **Socket.IO** - For real-time communication
- **Prisma** - For the database toolkit
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/AdarshPandey011/chat-application/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AdarshPandey011/chat-application/discussions)

## 🗺️ Roadmap

- [ ] **Mobile App** - React Native version
- [ ] **Video Calls** - WebRTC integration
- [ ] **Message Encryption** - End-to-end encryption
- [ ] **Voice Messages** - Audio recording and playback
- [ ] **Screen Sharing** - Share screen in rooms
- [ ] **Bot Framework** - Chatbot integration
- [ ] **Analytics** - Usage analytics and insights
- [ ] **Multi-language** - Internationalization

---

**Built with ❤️ by [Adarsh Pandey](https://github.com/AdarshPandey011)**

*Star ⭐ this repository if you find it helpful!*