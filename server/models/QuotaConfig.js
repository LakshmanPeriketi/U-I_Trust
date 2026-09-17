import mongoose from 'mongoose';

// Created by Admin (PRD 4). Read by quotaService (PRD 3).
const quotaConfigSchema = new mongoose.Schema(
  {
    ngo:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    maxActiveRequests: { type: Number, default: 5 },
    monthlyLimit:      { type: Number, default: 20 },
    notes:             { type: String },
    setBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who set it
  },
  { timestamps: true }
);

export default mongoose.model('QuotaConfig', quotaConfigSchema);
