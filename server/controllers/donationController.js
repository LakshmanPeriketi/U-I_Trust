import Donation from '../models/Donation.js';

// GET /api/donations & GET /api/donations/mine
export const listDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'donor' || req.query.mine === 'true') {
      filter.donorId = req.user._id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const donations = await Donation.find(filter)
      .populate('donorId', 'name area rating')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list donations' });
  }
};

// POST /api/donations
export const createDonation = async (req, res) => {
  try {
    const { itemType, condition, photos, quantity } = req.body;
    if (!itemType) {
      return res.status(400).json({ message: 'itemType is required' });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      itemType,
      condition: condition || 'good',
      photos: Array.isArray(photos) ? photos : [],
      quantity: quantity ? Number(quantity) : 1,
      status: 'listed',
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create donation' });
  }
};

// GET /api/donations/:id
export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId', 'name area rating');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch donation' });
  }
};

// PATCH /api/donations/:id
export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    const { itemType, condition, photos, quantity, status } = req.body;
    if (itemType !== undefined) donation.itemType = itemType;
    if (condition !== undefined) donation.condition = condition;
    if (photos !== undefined) donation.photos = photos;
    if (quantity !== undefined) donation.quantity = quantity;
    if (status !== undefined) donation.status = status;

    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update donation' });
  }
};

// DELETE /api/donations/:id
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    donation.status = 'cancelled';
    await donation.save();
    res.json({ message: 'Donation cancelled successfully', donation });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete donation' });
  }
};

