import jwt  from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── POST /api/auth/register ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, area } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // passwordHash field — pre-save hook will bcrypt it
    const user = await User.create({
      name,
      email,
      phone:        phone  || undefined,
      passwordHash: password,
      role,
      area:         area   || undefined,
      status:       role === 'admin' ? 'verified' : 'pending',
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: _safeUser(user),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    const token = signToken(user._id);
    res.json({ token, user: _safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/otp/request ────────────────────────────────────────────
// Stub — donor OTP path. Phase 2 will integrate an SMS provider.
export const otpRequest = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone is required' });

    // TODO (Phase 2): send real OTP via SMS provider
    // For MVP we accept any code; return a mock success.
    res.json({ message: 'OTP sent (stub — check console for dev code)', devCode: '123456' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/auth/otp/verify ─────────────────────────────────────────────
// Stub — verifies donor OTP and returns JWT.
export const otpVerify = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone and code are required' });

    // TODO (Phase 2): validate real OTP
    // MVP stub: any code works, find or create the user.
    if (code !== '123456') {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      // Auto-register phone-only donor
      user = await User.create({
        name:         phone,
        email:        `${phone}@otp.local`,
        phone,
        passwordHash: `otp_${phone}`,
        role:         'donor',
        status:       'verified',
      });
    }

    const token = signToken(user._id);
    res.json({ token, user: _safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────
export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// ── Helper ────────────────────────────────────────────────────────────────
function _safeUser(user) {
  return {
    id:     user._id,
    name:   user.name,
    email:  user.email,
    phone:  user.phone,
    role:   user.role,
    status: user.status,
    area:   user.area,
    rating: user.rating,
  };
}
