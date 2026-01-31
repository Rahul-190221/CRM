import express from 'express';
import { register, login, googleLogin, getProfile, forgetPassword, resetPassword } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', getProfile);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

export default router;
