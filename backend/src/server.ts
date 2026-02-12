import dotenv from 'dotenv';
import createApp from './config/app';
import connectDB from './config/database';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create Express app
const app = createApp();

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;