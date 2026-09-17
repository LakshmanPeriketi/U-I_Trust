import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

// ── FROZEN after Foundation merge — role PRDs never edit this file ─────────
const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ['donor', 'ngo', 'admin'], required: true },

    // pending → awaiting review, verified → active, rejected → denied, suspended → banned
    status: {
      type:    String,
      enum:    ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },

    // NGO vetting documents (array of URLs / file paths)
    vettingDocs: [{ type: String }],

    // Service area / locality string (donor or NGO)
    area:   { type: String, trim: true },

    // Average rating given by counterparty (updated after each completed match)
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }   // adds createdAt + updatedAt
);

// ── Hash password before save ──────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ── Instance method: compare plain password against hash ──────────────────
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
