import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getPendingUsers,
  approveUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  rejectUser,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  adminCreateUser,   // NEW
  getUserById,       // NEW
  getUserActivity,   // NEW
} from '../controllers/user.controllers.js';

import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.post('/approve/:id', authenticateJWT, authorizeRoles('Admin'), approveUser);
router.post('/reject/:id', authenticateJWT, authorizeRoles('Admin'), rejectUser);

router.get('/profile', authenticateJWT, getUserProfile);

router.get('/pending', authenticateJWT, authorizeRoles('Admin'), getPendingUsers);
router.get('/', authenticateJWT, authorizeRoles('Admin'), getAllUsers);
router.post('/', authenticateJWT, authorizeRoles('Admin'), adminCreateUser); // NEW
router.get('/:id', authenticateJWT, authorizeRoles('Admin'), getUserById);   // NEW
router.get('/:id/activity', authenticateJWT, authorizeRoles('Admin'), getUserActivity); // NEW
router.patch('/:id/status', authenticateJWT, authorizeRoles('Admin'), updateUserStatus);
router.patch('/:id/role', authenticateJWT, authorizeRoles('Admin'), updateUserRole);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), deleteUser);

export default router;