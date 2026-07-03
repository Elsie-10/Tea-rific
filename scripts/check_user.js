require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  const email = process.argv[2] || 'tester+automation@example.com';
  const user = await mongoose.connection.collection('users').findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.log('User not found:', email);
  } else {
    console.log('User found:');
    console.log({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
