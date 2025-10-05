import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

export { kafka };

// Kafka producers
export const messageProducer = kafka.producer();
export const notificationProducer = kafka.producer();

// Kafka consumers
export const messageConsumer = kafka.consumer({ groupId: 'chat-service' });
export const notificationConsumer = kafka.consumer({ groupId: 'notification-service' });

// Initialize producers
export const initializeKafka = async () => {
  try {
    await messageProducer.connect();
    await notificationProducer.connect();
    console.log('✅ Kafka producers connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka producers:', error);
  }
};

// Initialize consumers
export const initializeConsumers = async () => {
  try {
    await messageConsumer.connect();
    await notificationConsumer.connect();
    
    // Subscribe to topics
    await messageConsumer.subscribe({ topic: 'message-events', fromBeginning: false });
    await notificationConsumer.subscribe({ topic: 'notifications', fromBeginning: false });
    
    console.log('✅ Kafka consumers connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka consumers:', error);
  }
};
