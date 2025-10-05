# 🚀 ChatApp Deployment Guide

## Quick Deploy to Railway

### 1. Setup Railway CLI
```bash
# Install Railway CLI (already done)
npm install -g @railway/cli

# Login to Railway (run this manually)
railway login
```

### 2. Deploy to Railway
```bash
# Link project to Railway
railway link

# Deploy all services
railway up
```

### 3. Set Environment Variables in Railway Dashboard
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/chatapp
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAFKA_BROKERS=kafka:9092
AUTH_SERVICE_URL=http://auth-service:3001
CHAT_SERVICE_URL=http://chat-service:3002
API_GATEWAY_URL=http://api-gateway:4000
FRONTEND_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_WS_URL=wss://your-websocket.railway.app
```

## Alternative: Manual Deploy Steps

### Option 1: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `chat-application` repository
5. Railway will auto-detect the Docker setup
6. Add environment variables in the dashboard
7. Deploy!

### Option 2: Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

## Free Deployment URLs

After deployment, you'll get:
- **Backend**: `https://your-app.railway.app`
- **Frontend**: `https://your-app.vercel.app`
- **Database**: Managed by Railway
- **Cost**: $0/month (within free tier limits)

## Testing Deployment

1. Visit your frontend URL
2. Try the "Demo Mode" for quick testing
3. Test user registration/login
4. Test real-time messaging

## Troubleshooting

- **Build fails**: Check environment variables
- **Database connection**: Ensure DATABASE_URL is correct
- **WebSocket issues**: Check NEXT_PUBLIC_WS_URL
- **CORS errors**: Verify FRONTEND_URL matches your domain

## Production Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Set up Google OAuth credentials
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/logging
- [ ] Configure backups for database
