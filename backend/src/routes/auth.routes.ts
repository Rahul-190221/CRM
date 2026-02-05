import express from 'express';
import { register, login, googleLogin, getProfile, forgetPassword, resetPassword, getUsers, updateUserRole, deleteUser, updateProfile, changePassword, getUserStats } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.get('/stats', authenticateToken, getUserStats);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

// User management routes (admin only)
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
