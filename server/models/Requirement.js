import mongoose from 'mongoose';

// Owned by NGO PRD after foundation merge — foundation only writes shape.
const requirementSchema = new mongoose.Schema(
  {
    ngoId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType:        { type: String },
    quantityNeeded:  { type: Number, default: 1 },
    urgency:         { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    beneficiaryGroup:{ type: String },
    status:          { type: String, enum: ['open', 'matched', 'fulfilled', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

// TODO: NGO PRD implements logic here

export default mongoose.model('Requirement', requirementSchema);
