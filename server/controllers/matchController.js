import Match from '../models/Match.js';
import Donation from '../models/Donation.js';
import Requirement from '../models/Requirement.js';
import User from '../models/User.js';
import { checkQuota } from '../services/quotaService.js';

// GET /api/matches & GET /api/matches/mine
export const listMatches = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'donor' || req.query.mine === 'true') {
      filter.donorId = req.user._id;
    } else if (req.user.role === 'ngo') {
      filter.ngoId = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // PRIVACY AUDIT: Only populate name, area, rating for users (no phone, no email)
    const matches = await Match.find(filter)
      .populate('donationId')
      .populate('requirementId')
      .populate('ngoId', 'name area rating')
      .populate('donorId', 'name area rating')
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list matches' });
  }
};

// POST /api/matches (Pledge flow)
export const createMatch = async (req, res) => {
  try {
    const { donationId, requirementId, ngoId: targetNgoId } = req.body;

    if (!donationId) {
      return res.status(400).json({ message: 'donationId is required' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    let ngoId = targetNgoId;
    let requirement = null;

    if (requirementId) {
      requirement = await Requirement.findById(requirementId);
      if (!requirement) {
        return res.status(404).json({ message: 'Requirement not found' });
      }
      ngoId = requirement.ngoId;
    }

    if (!ngoId) {
      return res.status(400).json({ message: 'ngoId or valid requirementId is required' });
    }

    const category = (requirement && requirement.itemType) || donation.itemType || 'general';

    // Call quota service checkQuota
    const hasQuota = await checkQuota(ngoId, category);

    if (!hasQuota) {
      // Quota check failed -> create match as rejected or return error banner message
      const rejectedMatch = await Match.create({
        donationId,
        requirementId: requirementId || null,
        donorId: req.user._id,
        ngoId,
        status: 'rejected',
      });
      return res.status(400).json({
        message: 'This NGO has reached its limit — try another NGO.',
        match: rejectedMatch,
      });
    }

    // Quota check passed -> confirmed match
    const match = await Match.create({
      donationId,
      requirementId: requirementId || null,
      donorId: req.user._id,
      ngoId,
      status: 'confirmed',
    });

    // Update donation status to matched
    donation.status = 'matched';
    await donation.save();

    // Update requirement status to matched if requirement exists
    if (requirement && requirement.status === 'open') {
      requirement.status = 'matched';
      await requirement.save();
    }

    const populatedMatch = await Match.findById(match._id)
      .populate('donationId')
      .populate('requirementId')
      .populate('ngoId', 'name area rating')
      .populate('donorId', 'name area rating');

    res.status(201).json(populatedMatch);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create match' });
  }
};

// GET /api/matches/:id
export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('donationId')
      .populate('requirementId')
      .populate('ngoId', 'name area rating')
      .populate('donorId', 'name area rating');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Verify user is authorized (donor, ngo, or admin)
    const isDonor = match.donorId._id.toString() === req.user._id.toString();
    const isNgo = match.ngoId._id.toString() === req.user._id.toString();
    if (!isDonor && !isNgo && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this match' });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch match' });
  }
};

// PATCH /api/matches/:id
export const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (status) {
      match.status = status;
    }

    await match.save();

    const updated = await Match.findById(match._id)
      .populate('donationId')
      .populate('requirementId')
      .populate('ngoId', 'name area rating')
      .populate('donorId', 'name area rating');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update match status' });
  }
};

// POST /api/matches/:id/rate-ngo (Donor rates NGO)
export const rateNgo = async (req, res) => {
  try {
    const { rating } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the donor can rate this NGO' });
    }

    match.ngoRating = numericRating;
    await match.save();

    // Recalculate NGO average rating across all rated matches
    const ngoMatches = await Match.find({ ngoId: match.ngoId, ngoRating: { $exists: true, $ne: null } });
    if (ngoMatches.length > 0) {
      const avg = ngoMatches.reduce((acc, curr) => acc + curr.ngoRating, 0) / ngoMatches.length;
      const roundedAvg = Math.round(avg * 10) / 10;
      await User.findByIdAndUpdate(match.ngoId, { rating: roundedAvg });
    }

    const updatedMatch = await Match.findById(match._id)
      .populate('donationId')
      .populate('requirementId')
      .populate('ngoId', 'name area rating')
      .populate('donorId', 'name area rating');

    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to rate NGO' });
  }
};

