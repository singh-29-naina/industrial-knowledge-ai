import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'engineering', 'Engineering',
        'production', 'Production',
        'maintenance', 'Maintenance',
        'operations', 'Operations',
        'quality', 'Quality',
        'safety', 'Safety',
        'hr', 'HR',
        'it', 'IT'
      ]
    },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

export const PendingUser = mongoose.model('PendingUser', pendingUserSchema);