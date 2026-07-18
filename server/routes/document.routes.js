import express from 'express';
import {
  uploadDocument,
  getDocuments,
  deleteDocument
} from '../controllers/documentController.js';
import { upload } from '../middleware/upload.js';
import { authenticateJWT } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

router.post('/upload', authenticateJWT, upload.single('file'), uploadDocument);
router.get('/', authenticateJWT, getDocuments);
router.delete('/:id', authenticateJWT, deleteDocument);

// Small local helper — was missing entirely, causing a silent ReferenceError
function formatTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

router.get("/activities", authenticateJWT, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(5);
    const formattedLogs = logs.map(log => ({
      type: log.type,
      title: log.title,
      subtitle: `${log.userName} • ${formatTime(log.createdAt)}`
    }));
    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('Activities route error:', error.message); // add this so future 500s aren't silent
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;