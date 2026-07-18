import { ChatSession } from '../models/chatModel.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const getUserChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.userId }).sort({ updatedAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve chat sessions', error: error.message });
  }
};

export const getChatSessionById = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Chat history thread not found.' });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving thread details', error: error.message });
  }
};

export const deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!session) return res.status(404).json({ message: 'Chat thread not found or unauthorized.' });
    res.status(200).json({ message: 'Conversation history wiped successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear thread context', error: error.message });
  }
};

export const streamChatResponse = async (req, res) => {
  let session;
  let isNewSession = false;

  try {
    const { question, documentName, documentTitle, history, sessionId } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, user: req.user.userId });
    }
    if (!session) {
      session = new ChatSession({
        user: req.user.userId,
        title: 'New Conversation',
        contextDocument: documentName
          ? { fileName: documentName, title: documentTitle || documentName }
          : undefined,
        messages: []
      });
      isNewSession = true;
      await session.save();
    }

    res.write(`data: ${JSON.stringify({ type: 'session', sessionId: session._id, contextDocument: session.contextDocument })}\n\n`);

    session.messages.push({ sender: 'user', text: question });
    await session.save();

    const scopedDocumentName = session.contextDocument?.fileName || documentName || null;

    const aiResponse = await axios({
      method: 'post',
      url: `${AI_SERVICE_URL}/api/ai/query`,
      data: { question, documentName: scopedDocumentName, history: history || [] },
      responseType: 'stream'
    });

    let fullAnswer = '';
    let metadataStripped = false;
    let carry = '';

    aiResponse.data.on('data', (rawChunk) => {
      let str = rawChunk.toString();

      if (!metadataStripped) {
        carry += str;
        const newlineIdx = carry.indexOf('\n');
        if (newlineIdx === -1) return;
        if (carry.startsWith('METADATA:')) {
          carry = carry.slice(newlineIdx + 1);
        }
        metadataStripped = true;
        str = carry;
        carry = '';
      }

      if (str) {
        fullAnswer += str;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: str })}\n\n`);
      }
    });

    aiResponse.data.on('end', async () => {
      try {
        session.messages.push({ sender: 'ai', text: fullAnswer });
        await session.save();

        if (isNewSession) {
          try {
            const titleRes = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-title`, {
              first_question: question
            });
            const newTitle = titleRes.data?.title;
            if (newTitle) {
              session.title = newTitle;
              await session.save();
            }
          } catch (titleErr) {
            console.error('Title generation failed:', titleErr.message);
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done', sessionId: session._id, title: session.title })}\n\n`);
      } catch (persistErr) {
        console.error('Failed to persist AI reply:', persistErr.message);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Reply generated but failed to save.' })}\n\n`);
      } finally {
        res.end();
      }
    });

    aiResponse.data.on('error', (streamErr) => {
      console.error('AI stream error:', streamErr.message);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'AI engine stream failed mid-response.' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      aiResponse.data.destroy();
    });

  } catch (error) {
    console.error('AI Proxy Error:', error.message);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to connect to the AI engine.' })}\n\n`);
    res.end();
  }
};

export const generateSessionTitle = async (req, res) => {
  try {
    const { first_question } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-title`, { first_question });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Title Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to generate title summary' });
  }
};