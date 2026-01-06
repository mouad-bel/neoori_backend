import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/password-reset/request', authController.requestPasswordReset.bind(authController));
router.post('/password-reset/reset', authController.resetPassword.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));
router.post('/verify-email/resend', authenticateToken, authController.resendVerificationEmail.bind(authController));

export default router;

