import mongoose from 'mongoose';

// Owned by Donor PRD after foundation merge — foundation only writes shape.
const messageSchema = new mongoose.Schema(
  {
    matchId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    content:  { type: String, required: true, trim: true },
  },
  { timestamps: true }   // createdAt maps to PRD's created_at
);

// TODO: Donor PRD implements logic here

export default mongoose.model('Message', messageSchema);
