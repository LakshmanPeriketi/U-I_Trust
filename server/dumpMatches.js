import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const matches = await db.collection('matches').find().toArray();
  const output = [];
  for (let m of matches) {
    const ngo = await db.collection('users').findOne({_id: m.ngoId});
    const donor = await db.collection('users').findOne({_id: m.donorId});
    const req = await db.collection('requirements').findOne({_id: m.requirementId});
    output.push({
      matchId: m._id,
      ngo: ngo ? ngo.name : 'null',
      donor: donor ? donor.name : 'null',
      req: req ? req.itemType : 'null',
      status: m.status
    });
  }
  fs.writeFileSync('matches.json', JSON.stringify(output, null, 2));
  process.exit();
});
