import { Router } from 'express';
import {
  getSystemNodes,
  createSystemNode,
  updateSystemNode,
  deleteSystemNode,
} from '../controllers/systemMapController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/nodes', authenticateJWT, getSystemNodes);
router.post('/nodes', authenticateJWT, authorizeRoles('Admin', 'Engineer'), createSystemNode);
router.patch('/nodes/:id', authenticateJWT, authorizeRoles('Admin', 'Engineer'), updateSystemNode);
router.delete('/nodes/:id', authenticateJWT, authorizeRoles('Admin'), deleteSystemNode);

export default router;