import Match from '../models/Match.js';
import Donation from '../models/Donation.js'; // Needed to resolve category from donation

// Configurable per-category limits
const CATEGORY_LIMITS = {
  default: 10,
  food: 50,
  medical: 20,
  education: 30
};

export const checkQuota = async (ngoId, category) => {
  try {
    const limit = CATEGORY_LIMITS[category?.toLowerCase()] || CATEGORY_LIMITS.default;
    
    // Rolling 7-day window
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Statuses conceptually >= 'confirmed'
    const validStatuses = ['confirmed', 'in_transit', 'received', 'completed'];
    
    const matches = await Match.find({
      ngoId,
      status: { $in: validStatuses },
      createdAt: { $gte: sevenDaysAgo }
    }).populate('donationId'); // Populate to get itemType
    
    // Filter matches by category matching itemType
    const categoryMatches = matches.filter(m => m.donationId && m.donationId.itemType === category);
    
    return categoryMatches.length < limit;
  } catch (err) {
    console.error('Error checking quota:', err);
    // If error, return false to be safe
    return false; 
  }
};
