import Requirement from '../models/Requirement.js';
import User from '../models/User.js';

// POST /api/requirements/vetting-docs
// Note: PRD says /api/ngo/vetting-docs, but server.js mounts us at /api/requirements.
// Client will be adjusted to call /api/requirements/vetting-docs.
export const uploadVettingDocs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No documents provided' });
    }
    
    // Save file paths relative to server
    const docPaths = req.files.map(file => `/uploads/${file.filename}`);
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.vettingDocs = [...user.vettingDocs, ...docPaths];
    // if rejected earlier, move them back to pending since they re-uploaded
    if (user.status === 'rejected') user.status = 'pending';
    
    await user.save();
    
    res.json({ message: 'Documents uploaded successfully', docPaths, status: user.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload vetting documents' });
  }
};

// POST /api/requirements
export const createRequirement = async (req, res) => {
  try {
    if (req.user.status !== 'verified') {
      return res.status(403).json({ message: 'You must be verified to post requirements' });
    }
    
    const { itemType, quantityNeeded, urgency, beneficiaryGroup } = req.body;
    
    const newReq = new Requirement({
      ngoId: req.user._id,
      itemType,
      quantityNeeded,
      urgency,
      beneficiaryGroup,
      status: 'open'
    });
    
    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create requirement' });
  }
};

// GET /api/requirements/mine
export const getMyRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ ngoId: req.user._id }).sort({ createdAt: -1 });
    res.json(requirements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/requirements
export const getRequirements = async (req, res) => {
  try {
    // Return frozen shape on Day 1
    const requirements = await Requirement.find({ status: 'open' })
      .select('_id ngoId itemType quantityNeeded urgency beneficiaryGroup status')
      .lean();
    res.json(requirements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
