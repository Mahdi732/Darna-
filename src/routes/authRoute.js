import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { validateRequest } from '../middlewares/validatorMiddleware.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    resetPasswordSchema,
    requestPasswordResetSchema,
    updateProfileSchema,
    refreshTokenSchema
} from '../../validation/authValidation.js';

const router = express.Router();
const authController = new AuthController();

// Routes publiques
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/request-password-reset', validateRequest(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Routes protégées
router.post('/logout', authenticateToken, authController.logout);
router.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), authController.changePassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), authController.updateProfile);
router.get('/check', authenticateToken, authController.checkAuth);
router.get('/me', authenticateToken, authController.getProfile);

// Routes 2FA
router.get('/2fa/status', authenticateToken, authController.get2FAStatus);
router.post('/2fa/setup', authenticateToken, authController.generate2FASetup);
router.post('/2fa/enable', authenticateToken, authController.enable2FA);
router.post('/2fa/disable', authenticateToken, authController.disable2FA);
router.post('/2fa/verify', authenticateToken, authController.verify2FA);

export default router;