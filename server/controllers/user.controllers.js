import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { PendingUser } from '../models/PendingUser.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { approvalHtml, rejectionHtml } from '../templates/emailTemplates.js';
import ActivityLog from '../models/ActivityLog.js';
import { Settings } from '../models/settingsModel.js';
import ms from 'ms';


/**
 * @desc    Submit a signup request (Step 1: Save to Pending)
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, employeeId, email, department, password } = req.body;

    if (!name || !employeeId || !email || !department || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if already approved or active in the primary system
    const activeUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (activeUser) {
      return res.status(400).json({ message: 'This account is already active. Please log in.' });
    }

    // Check if there's already a pending request
    const existingPending = await PendingUser.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (existingPending) {
      return res.status(400).json({ message: 'Your registration request is already pending admin approval.' });
    }

    // Hash Password before storing securely in the temporary table
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the approval queue entry
    await PendingUser.create({
      name,
      employeeId,
      email,
      department,
      password: hashedPassword
    });

    res.status(202).json({
      message: 'Registration request received. Please wait until an administrator approves your account.'
    });

  } catch (error) {
    console.error("SERVER CRASH ERROR:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * @desc    Authenticate fully approved users
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // If not found in User, check if they are still stuck in Pending User queue
    if (!user) {
      const isPending = await PendingUser.findOne({ email: email.toLowerCase() });
      if (isPending) {
        return res.status(403).json({ message: 'Your account is still waiting for administrative approval.' });
      }
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    user.lastLogin = new Date();
    await user.save();

    // Live, admin-configurable session length from Settings — falls back to
    // ACCESS_TOKEN_EXPIRE in .env if no Settings doc exists yet.
    const settings = await Settings.findOne();
    const accessToken = generateAccessToken(user, settings?.security?.sessionTimeoutMinutes);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge now derived from the same env var the JWT itself is signed
      // with, so the cookie can never outlive the token inside it.
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRE || '7d')
    });

    res.status(200).json({
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * @desc    Fetch all pending signups (For Admin Dashboard notification count/list)
 * @route   GET /api/users/pending
 * @access  Private (Admin/Manager only)
 */
export const getPendingUsers = async (req, res) => {
  try {
    const pendingList = await PendingUser.find({ status: 'Pending' }).select('-password');
    res.status(200).json(pendingList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch queue data', error: error.message });
  }
};

/**
 * @desc    Fetch new Access Token using valid HTTP-Only Refresh Token
 * @route   POST /api/users/refresh
 * @access  Public (Relies on Cookie validation)
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Access Denied: No Refresh Token Provided' });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'your_default_refresh_secret_change_me',
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden: Invalid or Expired Refresh Token' });
        }

        // Wrapped in its own try/catch — this callback is detached from
        // the outer try/catch, so a DB error here previously hung the
        // request with no response ever sent.
        try {
          const user = await User.findById(decoded.userId);
          if (!user || !user.isActive) {
            return res.status(403).json({ message: 'User account no longer exists or is disabled' });
          }

          const settings = await Settings.findOne();
          const newAccessToken = generateAccessToken(user, settings?.security?.sessionTimeoutMinutes);

          res.status(200).json({
            accessToken: newAccessToken,
            role: user.role
          });
        } catch (innerError) {
          res.status(500).json({ message: 'Token refresh failed', error: innerError.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed', error: error.message });
  }
};

/**
 * @desc    Clear Refresh Cookie & End Session
 * @route   POST /api/users/logout
 * @access  Public
 */
export const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * @desc    Retrieve logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private (Requires Access Token Verification middleware)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile details', error: error.message });
  }
};

/**
 * @desc    Generate reset token, save to DB, and mail it to user
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security Best Practice: Don't explicitly say "User not found" to prevent email enumeration attacks.
      return res.status(200).json({ message: 'If the email matches an active account, a reset link will be sent.' });
    }

    // 1. Generate a random unhashed token hex string
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash it to store securely in the database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 3. Set token expiry time (e.g., 10 minutes from current time)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 4. Construct the absolute URL path targeting your frontend layout
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlMessage = `
      <h1>Industrial Knowledge Platform - Password Reset Request</h1>
      <p>A password reset request was initialized for your employee account.</p>
      <p>Please click the button below to update your security credentials. This link will expire in 10 minutes.</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>If you did not initiate this change request, please contact your plant network administrator immediately.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Industrial Platform - Password Reset Request',
        htmlMessage
      });

      res.status(200).json({ message: 'Password reset link dispatched via email.' });
    } catch (emailError) {
      // If email sending fails, clean up the database fields immediately
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return res.status(500).json({ message: 'Email could not be dispatched.', error: emailError.message });
    }

  } catch (error) {
    res.status(500).json({ message: 'Forgot password process failed.', error: error.message });
  }
};

/**
 * @desc    Validate token and finalize updating user password
 * @route   PUT /api/users/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'A new password string is required.' });
    }

    // Hash the token parameter from the URL to match the version in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find a user who has a matching token that is not expired yet
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Hash the newly provided plain text password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset tokens out completely
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Password reset execution failed.', error: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // Admin passes 'Engineer', 'Technician', 'Compliance_Officer', etc.

    if (!role) {
      return res.status(400).json({ message: 'You must assign a role to approve this user.' });
    }

    // 1. Locate the pending registration request
    const pendingRequest = await PendingUser.findById(id);
    if (!pendingRequest) {
      return res.status(404).json({ message: 'Approval request not found.' });
    }

    // 2. Migrate data over to final User collection
    const verifiedUser = await User.create({
      name: pendingRequest.name,
      employeeId: pendingRequest.employeeId,
      email: pendingRequest.email,
      department: pendingRequest.department,
      password: pendingRequest.password, // Pre-hashed
      role: role,
      isActive: true
    });

    // 3. Purge record out of the pending staging queue
    await PendingUser.findByIdAndDelete(id);

    // 4. Send approval notification email asynchronously
    try {
      await sendEmail({
        email: verifiedUser.email,
        subject: '🔒 Access Approved: Reliance K-Portal AI Core Services',
        htmlMessage: approvalHtml(verifiedUser.name, role),
      });
    } catch (emailError) {
      console.error(`Warning: Approval email failed to send to ${verifiedUser.email}:`, emailError);
    }

    res.status(200).json({
      message: `User approved successfully and assigned the role of ${role}.`,
      userId: verifiedUser._id
    });

  } catch (error) {
    res.status(500).json({ message: 'Approval execution failed', error: error.message });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const pendingId = req.params.id;

    // 1. Find the user in staging
    const pendingUser = await PendingUser.findById(pendingId);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending registration request not found." });
    }

    // 2. Copy email details for notification before deleting
    const targetEmail = pendingUser.email;
    const targetName = pendingUser.name;

    // 3. Remove them from the staging queue
    await PendingUser.findByIdAndDelete(pendingId);

    // 4. Send rejection email asynchronously
    try {
      await sendEmail({
        email: targetEmail,
        subject: 'K-Portal Registration Application Status Update',
        htmlMessage: rejectionHtml(targetName),
      });
    } catch (emailError) {
      console.error(`Warning: Rejection email failed to send to ${targetEmail}:`, emailError);
    }

    res.status(200).json({
      message: "Registration request successfully declined and removed from queue."
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during rejection process.", error: error.message });
  }
};

/**
 * @desc    Fetch all active/approved users (Admin directory)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

/**
 * @desc    Update a user's status (Active / Suspended / Inactive)
 * @route   PATCH /api/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status, isActive: status === 'Active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: `Status updated to ${status}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

/**
 * @desc    Update a user's role
 * @route   PATCH /api/users/:id/role
 * @access  Private (Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['Technician', 'Engineer', 'Manager', 'Compliance_Officer', 'Admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role value.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: `Role updated to ${role}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};

/**
 * @desc    Deprovision (delete) a user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deprovisioned successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, employeeId, email, department, role } = req.body;

    if (!name || !employeeId || !email || !department) {
      return res.status(400).json({ message: 'name, employeeId, email, and department are required.' });
    }

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email or employee ID already exists.' });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex'); // e.g. "a1b2c3d4e5f6"
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
      name,
      employeeId,
      email,
      department,
      role: role || 'Technician',
      password: hashedPassword,
      status: 'Active',
      isActive: true,
    });

    await ActivityLog.create({
      type: 'user',
      title: `${newUser.name} provisioned by admin`,
      userName: req.user.email || 'Admin',
      userId: req.user.userId,
      metadata: { newUserId: newUser._id },
    });

    // Temp password returned once, in-response only — nowhere else, no email sent yet.
    // Flagging: you'll want a real email-delivery step here before using this in production.
    res.status(201).json({
      message: 'User provisioned successfully.',
      user: { ...newUser.toObject(), password: undefined },
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Admin views any user's full profile (distinct from getUserProfile, which is self-only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

// Admin views a specific user's recent activity log
export const getUserActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user activity', error: error.message });
  }
};