import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  category: { type: String, default: 'Manuals' },
  department: { type: String },
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  characterCount: { type: Number },
  status: { type: String, enum: ['Ingested', 'Failed'], default: 'Ingested' }
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);