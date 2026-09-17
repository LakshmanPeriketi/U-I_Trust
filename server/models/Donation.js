import mongoose from 'mongoose';

// Owned by Donor PRD — listings created by donors
const donationSchema = new mongoose.Schema(
  {
    donorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType:  { type: String, required: true, trim: true },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'], default: 'good' },
    photos:    [{ type: String }],   // array of image URLs / paths / base64
    quantity:  { type: Number, default: 1, min: 1 },
    status:    {
      type:    String,
      enum:    ['listed', 'available', 'matched', 'completed', 'cancelled'],
      default: 'listed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);

