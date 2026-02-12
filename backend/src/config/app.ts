import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from '../routes';
import { errorHandler } from '../middlewares/error.middleware';
import logger from '../utils/logger';

const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
};

export default createApp;