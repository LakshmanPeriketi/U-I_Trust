import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const matches = await db.collection('matches').find().toArray();
  const ngoIds = matches.map(m => m.ngoId);
  const users = await db.collection('users').find({_id: { $in: ngoIds } }).toArray();
  console.log('--- NGO USERS WITH MATCHES ---');
  users.forEach(u => console.log(u.email, '-', u.name));
  console.log('--- ALL NGO USERS ---');
  const allNgos = await db.collection('users').find({role: 'ngo'}).toArray();
  allNgos.forEach(u => console.log(u.email, '-', u.name));
  process.exit(0);
}).catch(console.error);
