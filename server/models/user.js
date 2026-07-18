import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Company Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid company email address'],
    },
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    // The role can be inferred from the department or assigned by an admin later
    role: {
      type: String,
      enum: ['Technician', 'Engineer', 'Manager', 'Compliance_Officer', 'Admin'],
      default: 'Technician',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    },
    // Add alongside isActive
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);


export const User = mongoose.model('User', userSchema);