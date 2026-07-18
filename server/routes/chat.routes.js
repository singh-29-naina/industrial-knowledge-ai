import express from 'express';
import { getUserChatSessions, getChatSessionById, deleteChatSession,streamChatResponse,   generateSessionTitle } from '../controllers/chatController.js';
import { authenticateJWT } from '../middleware/auth.js';
const router = express.Router();
import axios from 'axios';

const AI_SERVICE_URL = 'http://127.0.0.1:8000';

router.route('/').get(authenticateJWT, getUserChatSessions);
router.route('/:id').get(authenticateJWT, getChatSessionById).delete(authenticateJWT, deleteChatSession);
router.route('/stream')
    .post(authenticateJWT, streamChatResponse);

router.route('/title')
    .post(authenticateJWT, generateSessionTitle);


export default router;
