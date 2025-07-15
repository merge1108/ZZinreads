import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import logger from '../utils/logger';
import { ApiResponse } from '../types';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://googleads.googleapis.com", "https://api.notion.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 요청 제한
  message: {
    success: false,
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    timestamp: new Date().toISOString(),
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 인증 시도 제한
  message: {
    success: false,
    error: '너무 많은 로그인 시도입니다. 15분 후 다시 시도해주세요.',
    timestamp: new Date().toISOString(),
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: '너무 많은 로그인 시도입니다. 15분 후 다시 시도해주세요.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  },
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Error:', logData);
    } else {
      logger.info('HTTP Request:', logData);
    }
  });

  next();
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
    ...(isDevelopment && { details: error.message, stack: error.stack }),
    timestamp: new Date().toISOString(),
  } as ApiResponse);
};

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;

  if (validApiKey && apiKey !== validApiKey) {
    logger.warn(`Invalid API key attempt from IP: ${req.ip}`);
    res.status(401).json({
      success: false,
      error: '유효하지 않은 API 키입니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
    return;
  }

  next();
};