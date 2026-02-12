import { Response } from 'express';

class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, 201);
  }

  static badRequest(res: Response, message: string, errors?: any): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Not found'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string): Response {
    return this.error(res, message, 409);
  }

  static serverError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }
}

export default ApiResponse;