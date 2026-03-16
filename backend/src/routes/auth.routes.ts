import express from 'express';
import { register, login, googleLogin, googleRegister, getProfile, forgetPassword, resetPassword, getUsers, updateUserRole, deleteUser, updateProfile, changePassword, getUserStats, setPassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/google-register', googleRegister);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.get('/stats', authenticateToken, getUserStats);
router.post('/set-password', setPassword);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

// User management routes (admin only)
router.get('/users', authenticateToken, getUsers);
router.put('/users/:id/role', authenticateToken, updateUserRole);
router.delete('/users/:id', authenticateToken, deleteUser);

export default router;
