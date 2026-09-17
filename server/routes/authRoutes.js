import { Router }                                       from 'express';
import { register, login, otpRequest, otpVerify, getMe } from '../controllers/authController.js';
import authMiddleware                                    from '../middleware/authMiddleware.js';

const router = Router();

// Public
router.post('/register',    register);
router.post('/login',       login);

// Donor OTP path (Phase 2 SMS; MVP stub)
router.post('/otp/request', otpRequest);
router.post('/otp/verify',  otpVerify);

// Protected
router.get('/me', authMiddleware, getMe);

export default router;
