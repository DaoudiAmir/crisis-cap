import 'dotenv/config';
import { logger } from './utils/logger';
import connectDB from './config/database';
import AppServer from './config/server';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize server
    const app = new AppServer();
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // Start server
    app.start(PORT);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
