import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

class AuthService {
  private static readonly ADMIN_USERNAME = 'admin';
  private static readonly ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      config.server.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token: string): { id: string; username: string } | null {
    try {
      return jwt.verify(token, config.server.jwtSecret) as { id: string; username: string };
    } catch (error) {
      logger.warn('토큰 검증 실패:', error);
      return null;
    }
  }

  static async authenticate(username: string, password: string): Promise<{ success: boolean; token?: string }> {
    try {
      if (username !== this.ADMIN_USERNAME) {
        logger.warn(`인증 실패: 잘못된 사용자명 - ${username}`);
        return { success: false };
      }

      if (!this.ADMIN_PASSWORD_HASH) {
        logger.error('관리자 비밀번호 해시가 설정되지 않았습니다.');
        return { success: false };
      }

      const isValid = await this.comparePassword(password, this.ADMIN_PASSWORD_HASH);
      
      if (!isValid) {
        logger.warn(`인증 실패: 잘못된 비밀번호 - ${username}`);
        return { success: false };
      }

      const token = this.generateToken('admin', username);
      logger.info(`사용자 ${username} 인증 성공`);
      
      return { success: true, token };
    } catch (error) {
      logger.error('인증 처리 중 오류:', error);
      return { success: false };
    }
  }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      success: false, 
      error: '인증 토큰이 필요합니다.',
      timestamp: new Date().toISOString()
    });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = AuthService.verifyToken(token);

  if (!decoded) {
    res.status(401).json({ 
      success: false, 
      error: '유효하지 않은 토큰입니다.',
      timestamp: new Date().toISOString()
    });
    return;
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

export default AuthService;