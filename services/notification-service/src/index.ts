import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { kafka, initializeKafka, initializeConsumers } from './lib/kafka';
import { setupEventHandlers } from './handlers/eventHandlers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service' });
});

// Initialize Kafka and start event processing
async function startService() {
  try {
    console.log('🚀 Starting Notification Service...');
    
    // Initialize Kafka consumers
    await initializeConsumers();
    
    // Setup event handlers
    setupEventHandlers();
    
    console.log('✅ Notification Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to start Notification Service:', error);
    process.exit(1);
  }
}

// Start the service
startService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await kafka.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await kafka.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Notification service running on port ${PORT}`);
});
