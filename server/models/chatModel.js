import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  contextDocuments: [{
    fileName: { type: String },
    title: { type: String }
  }],
  messages: [messageSchema]
}, { timestamps: true });

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);