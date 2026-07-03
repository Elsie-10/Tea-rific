require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  const email = 'tester+automation@example.com';
  const existing = await mongoose.connection.collection('users').findOne({ email });
  if (existing) {
    console.log('User already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash('TestPass123', 12);
  const now = new Date();
  const res = await mongoose.connection.collection('users').insertOne({
    name: 'Automation Tester',
    email,
    password: hashed,
    phone: '1234567890',
    role: 'customer',
    createdAt: now,
    updatedAt: now,
  });

  console.log('Inserted user id:', res.insertedId.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
