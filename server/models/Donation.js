import mongoose from 'mongoose';

// Owned by Donor PRD after foundation merge — foundation only writes shape.
const donationSchema = new mongoose.Schema(
  {
    donorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType:  { type: String },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] },
    photos:    [{ type: String }],   // array of image URLs / paths
    quantity:  { type: Number, default: 1 },
    status:    { type: String, enum: ['available', 'matched', 'completed', 'cancelled'], default: 'available' },
  },
  { timestamps: true }
);

// TODO: Donor PRD implements logic here

export default mongoose.model('Donation', donationSchema);
