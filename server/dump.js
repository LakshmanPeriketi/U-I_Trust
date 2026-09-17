import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const db = mongoose.connection.db; 
  const matches = await db.collection('matches').find().toArray(); 
  console.log(`Total Matches: ${matches.length}`); 
  const ngoIds = [...new Set(matches.map(m => m.ngoId.toString()))]; 
  console.log('NGO IDs in matches:', ngoIds); 
  const users = await db.collection('users').find({_id: { $in: ngoIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray(); 
  users.forEach(u => console.log('Matched NGO:', u.email, u.name)); 
  process.exit(); 
});
