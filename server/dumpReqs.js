import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const reqs = await db.collection('requirements').find().toArray();
  for (let r of reqs) {
    const u = await db.collection('users').findOne({ _id: r.ngoId });
    console.log(`Req: ${r.itemType} | NGO: ${u ? u.name : 'Unknown'}`);
  }
  process.exit();
});
