import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry found';
    isOperational = true;
  }

  // Log error
  if (!isOperational || statusCode >= 500) {
    logger.error(`Error: ${message}`, {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

export default errorHandler;