import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Donation from './models/Donation.js';
import Requirement from './models/Requirement.js';
import Match from './models/Match.js';
import Message from './models/Message.js';

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Create or update Test Donors & NGOs
    console.log('👤 Seeding Users (Donors & NGOs)...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    const donor1 = await User.findOneAndUpdate(
      { email: 'donor@example.com' },
      {
        name: 'John Doe (Donor)',
        email: 'donor@example.com',
        phone: '+1 555-0192',
        passwordHash: hashedPassword,
        role: 'donor',
        status: 'verified',
        area: 'Downtown Metro',
        rating: 4.9,
      },
      { upsert: true, new: true }
    );

    const donor2 = await User.findOneAndUpdate(
      { email: 'sarah.donor@example.com' },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.donor@example.com',
        phone: '+1 555-0144',
        passwordHash: hashedPassword,
        role: 'donor',
        status: 'verified',
        area: 'Westside Heights',
        rating: 5.0,
      },
      { upsert: true, new: true }
    );

    const ngo1 = await User.findOneAndUpdate(
      { email: 'hope@ngo.org' },
      {
        name: 'Hope Welfare Foundation',
        email: 'hope@ngo.org',
        phone: '+1 555-9810',
        passwordHash: hashedPassword,
        role: 'ngo',
        status: 'verified',
        area: 'Central District & East Side',
        rating: 4.8,
      },
      { upsert: true, new: true }
    );

    const ngo2 = await User.findOneAndUpdate(
      { email: 'carekids@ngo.org' },
      {
        name: 'Care Kids Shelter',
        email: 'carekids@ngo.org',
        phone: '+1 555-8822',
        passwordHash: hashedPassword,
        role: 'ngo',
        status: 'verified',
        area: 'North Shelter Hub',
        rating: 4.7,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Users seeded: 
   - Donor: donor@example.com (Password: password123)
   - Donor: sarah.donor@example.com (Password: password123)
   - NGO: hope@ngo.org (Password: password123)
   - NGO: carekids@ngo.org (Password: password123)`);

    // 2. Clear old test donations/requirements/matches/messages for clean state
    await Donation.deleteMany({ donorId: { $in: [donor1._id, donor2._id] } });
    await Requirement.deleteMany({ ngoId: { $in: [ngo1._id, ngo2._id] } });
    await Match.deleteMany({ donorId: { $in: [donor1._id, donor2._id] } });

    // 3. Seed NGO Requirements
    console.log('📋 Seeding NGO Requirements...');
    const req1 = await Requirement.create({
      ngoId: ngo1._id,
      itemType: 'Winter Blankets & Warm Clothing',
      quantityNeeded: 50,
      urgency: 'high',
      beneficiaryGroup: 'Night Homeless Shelter Families',
      status: 'open',
    });

    const req2 = await Requirement.create({
      ngoId: ngo1._id,
      itemType: '25kg Rice & Staple Grains',
      quantityNeeded: 20,
      urgency: 'high',
      beneficiaryGroup: 'Community Soup Kitchen',
      status: 'open',
    });

    const req3 = await Requirement.create({
      ngoId: ngo2._id,
      itemType: 'Primary School Textbooks & Supplies',
      quantityNeeded: 30,
      urgency: 'medium',
      beneficiaryGroup: 'After-School Learning Program',
      status: 'open',
    });

    const req4 = await Requirement.create({
      ngoId: ngo2._id,
      itemType: 'First Aid & Sanitary Kits',
      quantityNeeded: 15,
      urgency: 'low',
      beneficiaryGroup: 'Rural Children Healthcare Unit',
      status: 'open',
    });

    console.log(`✅ 4 NGO Requirements created.`);

    // 4. Seed Donor Donations
    console.log('📦 Seeding Donor Donations...');
    const don1 = await Donation.create({
      donorId: donor1._id,
      itemType: 'Heavy Duty Thermal Blankets',
      condition: 'new',
      quantity: 50,
      photos: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500'],
      status: 'matched',
    });

    const don2 = await Donation.create({
      donorId: donor1._id,
      itemType: 'Grade 5 & 6 Math & Science Textbooks',
      condition: 'good',
      quantity: 30,
      photos: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500'],
      status: 'listed',
    });

    const don3 = await Donation.create({
      donorId: donor1._id,
      itemType: 'Basmati Rice Sacks (25kg each)',
      condition: 'new',
      quantity: 10,
      photos: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'],
      status: 'completed',
    });

    const don4 = await Donation.create({
      donorId: donor2._id,
      itemType: 'Medical & First Aid Kits (Full Pack)',
      condition: 'new',
      quantity: 15,
      photos: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500'],
      status: 'listed',
    });

    console.log(`✅ 4 Donor Donations created.`);

    // 5. Seed Matches & Handover Progress
    console.log('🤝 Seeding Matches...');
    const match1 = await Match.create({
      donationId: don1._id,
      requirementId: req1._id,
      donorId: donor1._id,
      ngoId: ngo1._id,
      status: 'in_transit',
      usageUpdates: [
        'Pledge confirmed by Hope Welfare Foundation.',
        'Donation picked up by volunteer transport from donor area.',
        'Items in transit to Central Night Shelter distribution point.',
      ],
    });

    const match2 = await Match.create({
      donationId: don3._id,
      requirementId: req2._id,
      donorId: donor1._id,
      ngoId: ngo1._id,
      status: 'completed',
      ngoRating: 5,
      conditionOnReceipt: 'All 10 sacks sealed and in pristine condition',
      usageUpdates: [
        'Rice sacks received at Central Soup Kitchen warehouse.',
        'Distributed in weekly meal packages to 250 families.',
      ],
    });

    console.log(`✅ 2 Matches seeded.`);

    // 6. Seed Chat Messages for Match 1
    console.log('💬 Seeding Messages for active match...');
    await Message.deleteMany({ matchId: match1._id });

    await Message.create({
      matchId: match1._id,
      senderId: donor1._id,
      content: 'Hello! I have packaged all 50 thermal blankets into 2 large boxes. When can your team pick them up?',
    });

    await Message.create({
      matchId: match1._id,
      senderId: ngo1._id,
      content: 'Hi John! Thank you so much for this generous donation. Our driver Marcus will arrive tomorrow at 2:00 PM.',
    });

    await Message.create({
      matchId: match1._id,
      senderId: donor1._id,
      content: 'Perfect! Marcus can park at the main entrance, I will bring the boxes down.',
    });

    await Message.create({
      matchId: match1._id,
      senderId: ngo1._id,
      content: 'Sounds great! We appreciate your support for the night shelter families.',
    });

    console.log(`✅ Chat messages seeded.`);

    console.log('🎉 SEEDING COMPLETE SUCCESSFULLY!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
