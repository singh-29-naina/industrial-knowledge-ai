import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  company: {
    name: { type: String, default: '' },
    industry: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  aiToggles: {
    copilotEnabled: { type: Boolean, default: true },
    autoIndexOnUpload: { type: Boolean, default: true },
    ocrEnabled: { type: Boolean, default: false }, // honest default — no OCR engine wired up yet
  },
  notificationToggles: {
    clearanceInquiries: { type: Boolean, default: true },
    maintenanceAlerts: { type: Boolean, default: true },
    complianceShifts: { type: Boolean, default: true },
  },
  security: {
    sessionTimeoutMinutes: { type: Number, default: 15 }, // matches your real ACCESS_TOKEN_EXPIRE
    minPasswordLength: { type: Number, default: 8 },       // matches your real userModel minlength
    twoFactorEnabled: { type: Boolean, default: false },   // honest — no 2FA implemented
  },
  storage: {
    maxUploadMB: { type: Number, default: 50 },             // matches your real multer limit
    defaultCategory: { type: String, default: 'SOPs' },
    acceptedFileTypes: {
      type: [String],
      default: ['PDF', 'XLSX', 'XLS', 'CSV'], // matches your real multer fileFilter — no DOCX/PNG/JSON accepted today
    },
  },
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '' },
    startedAt: { type: Date, default: null },
    estimatedEndAt: { type: Date, default: null },
    },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);