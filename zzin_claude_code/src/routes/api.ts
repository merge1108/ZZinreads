import { Router, Request, Response } from 'express';
import SchedulerService from '../services/schedulerService';
import AuthService, { requireAuth } from '../middleware/auth';
import { authRateLimit, validateApiKey } from '../middleware/security';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

const router = Router();
const schedulerService = new SchedulerService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

router.post('/auth/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '사용자명과 비밀번호가 필요합니다.',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const result = await AuthService.authenticate(username, password);

    if (result.success) {
      return res.json({
        success: true,
        data: { token: result.token },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } else {
      return res.status(401).json({
        success: false,
        error: '인증에 실패했습니다.',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  } catch (error) {
    logger.error('로그인 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await schedulerService.getSystemHealth();
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status !== 'unhealthy',
      data: health,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    logger.error('헬스체크 오류:', error);
    res.status(503).json({
      success: false,
      error: '헬스체크 실행 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

router.get('/status', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const jobStatus = schedulerService.getJobStatus();
    
    res.json({
      success: true,
      data: {
        scheduler: jobStatus,
        user: req.user?.username,
        uptime: process.uptime(),
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    logger.error('상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '상태 조회 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

router.post('/sync/manual', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    logger.info(`사용자 ${req.user?.username}이 수동 동기화를 요청했습니다.`);
    
    const result = await schedulerService.runManualSync();
    
    res.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    logger.error('수동 동기화 오류:', error);
    res.status(500).json({
      success: false,
      error: '동기화 실행 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

router.post('/webhook/sync', validateApiKey, async (_req: Request, res: Response) => {
  try {
    logger.info('웹훅을 통한 동기화 요청을 받았습니다.');
    
    const result = await schedulerService.runManualSync();
    
    res.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    logger.error('웹훅 동기화 오류:', error);
    res.status(500).json({
      success: false,
      error: '웹훅 동기화 실행 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

export default router;