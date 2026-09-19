import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requestOtp, verifyOtp, refreshToken, logout } from '../controllers/authController.js';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/otp/send', otpLimiter, requestOtp);
router.post('/otp/verify', otpLimiter, verifyOtp);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
