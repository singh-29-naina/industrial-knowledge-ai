import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getStackStatus,
  getMaintenanceStatus,
  updateMaintenanceMode,
  getSubsystemHealth,
} from '../controllers/settingsController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, getSettings);
router.put('/', authenticateJWT, authorizeRoles('Admin'), updateSettings);
router.get('/stack-status', authenticateJWT, getStackStatus);

// Deliberately public — must stay reachable even during a real outage or expired session
router.get('/maintenance-status', getMaintenanceStatus);
router.get('/health', getSubsystemHealth);
router.put('/maintenance', authenticateJWT, authorizeRoles('Admin'), updateMaintenanceMode);

export default router;