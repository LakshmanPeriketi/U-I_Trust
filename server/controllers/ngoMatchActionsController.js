import Match from '../models/Match.js';
import User from '../models/User.js';

// PATCH /api/ngo/match-actions/:id/confirm-receipt
export const confirmReceipt = async (req, res) => {
  try {
    const matchId = req.params.id;
    const match = await Match.findOne({ _id: matchId, ngoId: req.user._id });
    
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    // Accept confirmed, handover_scheduled, or in_transit match status
    const validReceiptStatuses = ['confirmed', 'handover_scheduled', 'in_transit'];
    if (!validReceiptStatuses.includes(match.status)) {
      return res.status(400).json({ message: `Match status '${match.status}' cannot be confirmed as received. Required status: ${validReceiptStatuses.join(', ')}` });
    }
    
    match.status = 'received';
    if (req.body.conditionOnReceipt) {
      match.conditionOnReceipt = req.body.conditionOnReceipt;
    }
    
    await match.save();
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to confirm receipt' });
  }
};

// POST /api/ngo/match-actions/:id/usage-update
export const usageUpdate = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { updateText } = req.body;
    const match = await Match.findOne({ _id: matchId, ngoId: req.user._id });
    
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    // Status sets to completed
    if (match.status !== 'received') {
      return res.status(400).json({ message: 'Match must be received to post usage updates' });
    }
    
    if (updateText) {
      match.usageUpdates = match.usageUpdates || [];
      match.usageUpdates.push(updateText);
    }
    
    match.status = 'completed';
    await match.save();
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post usage update' });
  }
};

// POST /api/ngo/match-actions/:id/rate-donor
export const rateDonor = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { rating } = req.body; // 1-5
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const match = await Match.findOne({ _id: matchId, ngoId: req.user._id });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    
    if (match.status !== 'completed') {
      return res.status(400).json({ message: 'Match must be completed to rate donor' });
    }
    
    match.donorRating = rating;
    await match.save();
    
    // Update donor's rating
    const donor = await User.findById(match.donorId);
    if (donor) {
       const donorMatches = await Match.find({ donorId: match.donorId, donorRating: { $exists: true } });
       const totalRating = donorMatches.reduce((acc, m) => acc + m.donorRating, 0);
       donor.rating = totalRating / donorMatches.length;
       await donor.save();
    }
    
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to rate donor' });
  }
};
