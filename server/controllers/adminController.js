import User from '../models/User.js';
import Match from '../models/Match.js';
import Donation from '../models/Donation.js';
import Requirement from '../models/Requirement.js';
import QuotaConfig from '../models/QuotaConfig.js';

export const getPendingNGOs = async (_req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', status: 'pending' }).select('-passwordHash');
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveNGO = async (req, res) => {
  try {
    const ngo = await User.findByIdAndUpdate(req.params.id, { status: 'verified' }, { new: true }).select('-passwordHash');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rejectNGO = async (req, res) => {
  try {
    const ngo = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).select('-passwordHash');
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const manageUserStatus = async (req, res) => {
  try {
    const { action } = req.params;
    const newStatus = action === 'restore' ? 'verified' : 'suspended';

    const user = await User.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const listDisputes = async (_req, res) => {
  try {
    const matches = await Match.find()
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name email phone')
      .populate('donationId')
      .populate('requirementId');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuotaConfig = async (req, res) => {
  try {
    const config = await QuotaConfig.findOne({ ngo: req.params.ngoId });
    if (!config) return res.status(404).json({ message: 'Quota config not found for this NGO.' });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setQuotaConfig = async (req, res) => {
  try {
    const { maxActiveRequests, monthlyLimit, notes } = req.body;
    let userId = req.user ? req.user.userId || req.user._id : undefined; // Depends on authMiddleware
    const config = await QuotaConfig.findOneAndUpdate(
      { ngo: req.params.ngoId },
      { maxActiveRequests, monthlyLimit, notes, setBy: userId },
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAnalytics = async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedNGOs = await User.countDocuments({ role: 'ngo', status: 'verified' });
    const totalDonations = await Donation.countDocuments();
    const totalRequirements = await Requirement.countDocuments();
    
    // Match metrics
    const totalMatches = await Match.countDocuments();
    const completedMatches = await Match.countDocuments({ status: 'completed' });
    const disputedMatches = await Match.countDocuments({ status: 'disputed' });
    
    const matchRate = totalDonations > 0 ? ((totalMatches / totalDonations) * 100).toFixed(1) : 0;
    const fulfillmentRate = totalRequirements > 0 ? ((completedMatches / totalRequirements) * 100).toFixed(1) : 0;

    res.json({
      totalUsers,
      verifiedNGOs,
      totalDonations,
      totalRequirements,
      totalMatches,
      completedMatches,
      disputedMatches,
      matchRate,
      fulfillmentRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
