import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail, sendPasswordResetOtpEmail } from '../utils/mailer.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'titanvitals_jwt_secure_secret_key_9842', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/send-signup-otp
// @desc    Generate 6-digit OTP, send to email, and store pending signup in MongoDB
// @access  Public
router.post('/send-signup-otp', async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check if user already exists in MongoDB
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean name
    const cleanName = name ? name.replace(/^dr\.\s*/i, '').trim() : cleanEmail.split('@')[0];

    // Store in Otp collection (auto-expires in 10 minutes)
    await Otp.findOneAndDelete({ email: cleanEmail }); // Clear previous OTP if any
    
    await Otp.create({
      email: cleanEmail,
      otp,
      userData: {
        name: cleanName,
        password, // raw password, User pre-save hook will hash it upon user creation
        bloodGroup: bloodGroup || 'O+',
        phone: phone || '',
        role: 'Patient / Health Member'
      }
    });

    // Send styled OTP email
    const mailResult = await sendOtpEmail(cleanEmail, otp, cleanName);

    console.log(`🔑 Verification OTP for ${cleanEmail}: ${otp}`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
      email: cleanEmail
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error generating OTP' });
  }
});

// @route   POST /api/auth/verify-signup-otp
// @desc    Verify OTP and create new user in MongoDB database
// @access  Public
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find OTP record in MongoDB
    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code expired or not found. Please request a new code.' 
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code. Please check your email and try again.' 
      });
    }

    // Double-check if user was created in the meantime
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      await Otp.deleteOne({ email: cleanEmail });
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }

    // Create user in MongoDB
    const { name, password, bloodGroup, phone } = otpRecord.userData;
    const user = await User.create({
      name: name || 'Alex Mercer',
      email: cleanEmail,
      password,
      role: 'Patient / Health Member',
      bloodGroup: bloodGroup || 'O+',
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    });

    // Delete OTP record once used
    await Otp.deleteOne({ email: cleanEmail });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Email successfully verified! Patient account created in MongoDB.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error verifying OTP' });
  }
});

// @route   POST /api/auth/send-forgot-password-otp
// @desc    Check user in MongoDB and send 6-digit password reset OTP
// @access  Public
router.post('/send-forgot-password-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check if user exists in MongoDB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not created in this email. Please create an account.'
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear previous OTP if any and store new OTP for password reset
    await Otp.findOneAndDelete({ email: cleanEmail });

    await Otp.create({
      email: cleanEmail,
      otp,
      userData: {
        name: user.name,
        role: user.role,
        type: 'forgot-password'
      }
    });

    // Send styled password reset OTP email
    await sendPasswordResetOtpEmail(cleanEmail, otp, user.name);

    console.log(`🔑 Password Reset OTP for ${cleanEmail}: ${otp}`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
      email: cleanEmail
    });
  } catch (error) {
    console.error('Send Forgot Password OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error generating reset code' });
  }
});

// @route   POST /api/auth/verify-forgot-password-otp
// @desc    Validate password reset OTP
// @access  Public
router.post('/verify-forgot-password-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired or not found. Please request a new code.'
      });
    }

    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    res.json({
      success: true,
      message: 'Verification code confirmed. You can now set your new password.'
    });
  } catch (error) {
    console.error('Verify Forgot Password OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error verifying OTP' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Update user password in MongoDB and return auth session
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Verify OTP is still valid in MongoDB
    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord || otpRecord.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification session. Please request a new code.'
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not created in this email. Please create an account.'
      });
    }

    // Update password (User pre-save hook will hash with bcrypt!)
    user.password = newPassword;
    await user.save();

    // Delete OTP record after successful reset
    await Otp.deleteOne({ email: cleanEmail });

    const token = generateToken(user._id);

    console.log(`🔐 Password successfully updated in MongoDB for ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Password has been changed successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating password' });
  }
});

// @route   POST /api/auth/signup (Direct signup fallback)
// @desc    Register a new patient user in MongoDB
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, bloodGroup } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in MongoDB
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Clean name from any 'Dr.' prefix so role is strictly Patient
    const cleanName = name ? name.replace(/^dr\.\s*/i, '').trim() : cleanEmail.split('@')[0];

    const user = await User.create({
      name: cleanName || 'Alex Mercer',
      email: cleanEmail,
      password,
      role: 'Patient / Health Member',
      bloodGroup: bloodGroup || 'O+',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token from MongoDB
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully via MongoDB!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth / Single Sign-On sync with MongoDB
// @access  Public
router.post('/google', async (req, res) => {
  try {
    let googleUser = {
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar
    };

    const clientId = process.env.GOOGLE_CLIENT_ID || '707844678299-hrve6vdl3hlrc20breuegb67mu6tv4al.apps.googleusercontent.com';

    // 1. If Google ID Token / Credential is provided
    if (req.body.credential || req.body.id_token) {
      const idToken = req.body.credential || req.body.id_token;
      try {
        const { OAuth2Client } = await import('google-auth-library');
        const googleClient = new OAuth2Client(clientId);
        const ticket = await googleClient.verifyIdToken({
          idToken: idToken,
          audience: clientId
        });
        const payload = ticket.getPayload();
        if (payload) {
          googleUser = {
            name: payload.name || payload.given_name,
            email: payload.email,
            avatar: payload.picture
          };
        }
      } catch (err) {
        console.warn('ID Token verify notice:', err.message);
      }
    } 
    // 2. If Google Access Token is provided
    else if (req.body.access_token) {
      try {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${req.body.access_token}` }
        });
        const data = await userinfoRes.json();
        if (data && data.email) {
          googleUser = {
            name: data.name || data.given_name,
            email: data.email,
            avatar: data.picture
          };
        }
      } catch (err) {
        console.warn('Google UserInfo fetch notice:', err.message);
      }
    }

    if (!googleUser.email) {
      return res.status(400).json({ success: false, message: 'Could not extract valid email from Google response' });
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();
    const cleanName = (googleUser.name || cleanEmail.split('@')[0]).replace(/^dr\.\s*/i, '').trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create new verified patient in MongoDB
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: Math.random().toString(36).slice(-10) + 'A1!',
        role: 'Patient / Health Member',
        bloodGroup: 'O+',
        avatar: googleUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
      });
    } else if (googleUser.avatar && !user.avatar) {
      user.avatar = googleUser.avatar;
      await user.save();
    }

    const token = generateToken(user._id);

    console.log(`✅ Google User authenticated in MongoDB: ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: `Google authentication successful for ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        healthId: user.healthId,
        bloodGroup: user.bloodGroup,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during Google authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update patient profile & settings in MongoDB
// @access  Public / Private
router.put('/profile', async (req, res) => {
  try {
    let userId = null;

    // Check token if provided
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'titanvitals_jwt_secure_secret_key_9842');
        userId = decoded.id;
      } catch (e) {}
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email.toLowerCase() });
    }

    if (!user && req.body.healthId) {
      user = await User.findOne({ healthId: req.body.healthId });
    }

    // Fallback: If no user found, find latest user or create one
    if (!user) {
      user = await User.findOne().sort({ createdAt: -1 });
    }

    if (!user) {
      user = new User({
        name: req.body.name || 'Alex Mercer',
        email: req.body.email || 'alex.mercer@titanvitals.ai',
        password: 'password123',
      });
    }

    // Update Profile Fields
    if (req.body.name) user.name = req.body.name.replace(/^dr\.\s*/i, '').trim();
    if (req.body.phone) user.phone = req.body.phone.trim();
    if (req.body.age !== undefined) user.age = Number(req.body.age);
    if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
    if (req.body.emergencyContactName) user.emergencyContactName = req.body.emergencyContactName.trim();
    if (req.body.emergencyContactPhone) user.emergencyContactPhone = req.body.emergencyContactPhone.trim();
    if (req.body.hospitalPreference) user.hospitalPreference = req.body.hospitalPreference.trim();
    if (req.body.allergies) user.allergies = req.body.allergies.trim();
    if (req.body.avatar) user.avatar = req.body.avatar;

    // Update Settings Subdocument if provided
    if (req.body.settings) {
      user.settings = {
        ...user.settings,
        ...req.body.settings
      };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Patient profile and settings successfully updated in MongoDB!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        age: updatedUser.age,
        role: updatedUser.role,
        healthId: updatedUser.healthId,
        bloodGroup: updatedUser.bloodGroup,
        emergencyContactName: updatedUser.emergencyContactName,
        emergencyContactPhone: updatedUser.emergencyContactPhone,
        hospitalPreference: updatedUser.hospitalPreference,
        allergies: updatedUser.allergies,
        settings: updatedUser.settings,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Update profile MongoDB error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
});

// @route   PUT /api/auth/settings
// @desc    Update system settings in MongoDB
// @access  Public / Private
router.put('/settings', async (req, res) => {
  try {
    let user = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'titanvitals_jwt_secure_secret_key_9842');
        user = await User.findById(decoded.id);
      } catch (e) {}
    }

    if (!user) {
      user = await User.findOne().sort({ createdAt: -1 });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB' });
    }

    user.settings = {
      ...user.settings,
      ...req.body.settings
    };

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'System settings synced to MongoDB!',
      settings: updatedUser.settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

