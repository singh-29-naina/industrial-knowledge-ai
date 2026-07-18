import mongoose from 'mongoose';

const systemNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true, unique: true, trim: true }, // e.g. "PUMP-101"
  type: { type: String, enum: ['Equipment', 'SOP Document', 'System Block'], required: true },
  label: { type: String, required: true },

  // Equipment-specific
  status: { type: String, enum: ['Optimal', 'Maintenance Required', 'Offline'], default: undefined },
  system: { type: String }, // e.g. "Water Feed"

  // Links this node to a real ingested document instead of a fake string
  linkedDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },

  // SOP Document-specific (denormalized for quick display even if linkedDocument is null)
  rev: { type: String },
  author: { type: String },

  // System Block-specific
  load: { type: String }, // e.g. "84%"

  // Graph edges — array of other nodeIds this node connects to
  connections: [{ type: String }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const SystemNode = mongoose.model('SystemNode', systemNodeSchema);