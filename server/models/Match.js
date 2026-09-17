import mongoose from 'mongoose';

// Owned by Donor PRD — NGO PRD writes to conditionOnReceipt / usageUpdates via API, never this file.
const matchSchema = new mongoose.Schema(
  {
    donationId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Donation',    required: true },
    requirementId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
    donorId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
    ngoId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User',        required: true },
    status:            {
      type:    String,
      enum:    [
        'pending_quota_check',
        'pending',
        'confirmed',
        'handover_scheduled',
        'in_transit',
        'received',
        'completed',
        'rejected',
        'disputed'
      ],
      default: 'confirmed',
    },
    conditionOnReceipt:{ type: String },
    usageUpdates:      [{ type: String }],   // NGO appends strings via API
    donorRating:       { type: Number, min: 1, max: 5 },   // NGO rates donor
    ngoRating:         { type: Number, min: 1, max: 5 },   // Donor rates NGO
  },
  { timestamps: true }
);

export default mongoose.model('Match', matchSchema);

