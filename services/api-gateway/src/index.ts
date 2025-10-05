import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { context } from './graphql/context';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(limiter);

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      {
        requestDidStart() {
          return {
            willSendResponse(requestContext) {
              // Add CORS headers
              requestContext.response.http.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
              requestContext.response.http.headers.set('Access-Control-Allow-Credentials', 'true');
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'api-gateway' });
  });

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
