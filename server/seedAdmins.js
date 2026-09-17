import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB. Seeding 5 admin records...');
  
  const admins = Array.from({ length: 5 }, (_, i) => ({
    name: `Platform Admin ${i + 1}`,
    email: `admin${i + 1}@trusted.org`,
    passwordHash: `admin123`,
    role: `admin`,
    status: `verified`
  }));
  
  for (let adminData of admins) {
    const exists = await User.findOne({ email: adminData.email });
    if (!exists) {
      await User.create(adminData);
      console.log(`Created: ${adminData.email}`);
    } else {
      console.log(`Already exists: ${adminData.email}`);
    }
  }
  
  console.log('✅ Finished seeding 5 admins.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
