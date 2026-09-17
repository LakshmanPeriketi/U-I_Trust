import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './models/Match.js';
import Requirement from './models/Requirement.js';
import Donation from './models/Donation.js';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const req = await Requirement.findOne({ itemType: 'rice' });
  const donor = await User.findOne({ role: 'donor' });
  console.log(`Req NGO ID: ${req.ngoId}`);
  console.log(`Donor ID: ${donor._id}`);
  
  // mock Create Match logic exactly as in controller
  let donationId = new mongoose.Types.ObjectId(); 
  // Let's create a dummy donation to ensure we have one
  const donation = await Donation.create({
    donorId: donor._id,
    itemType: 'rice',
    quantity: 10,
    condition: 'new',
    status: 'available',
    description: 'test'
  });
  
  console.log(`Created dummy donation: ${donation._id}`);
  
  try {
     const match = await Match.create({
        donationId: donation._id,
        requirementId: req._id,
        donorId: donor._id,
        ngoId: req.ngoId,
        status: 'confirmed',
     });
     console.log('Match successfully created!', match._id);
  } catch (err) {
     console.error('CRASH in Match creation!', err);
  }
  
  process.exit();
}).catch(console.error);
