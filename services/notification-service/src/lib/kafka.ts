import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

export { kafka };

// Kafka consumers
export const messageConsumer = kafka.consumer({ groupId: 'notification-service' });
export const userConsumer = kafka.consumer({ groupId: 'user-events' });

// Kafka producers
export const notificationProducer = kafka.producer();

// Initialize consumers
export const initializeConsumers = async () => {
  try {
    await messageConsumer.connect();
    await userConsumer.connect();
    await notificationProducer.connect();
    
    // Subscribe to topics
    await messageConsumer.subscribe({ topic: 'message-events', fromBeginning: false });
    await userConsumer.subscribe({ topic: 'user-events', fromBeginning: false });
    
    console.log('✅ Kafka consumers connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka consumers:', error);
    throw error;
  }
};

// Initialize producers
export const initializeKafka = async () => {
  try {
    await notificationProducer.connect();
    console.log('✅ Kafka producers connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka producers:', error);
    throw error;
  }
};
