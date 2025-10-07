const mongoose = require('mongoose');

main().catch(err => console.error('DB connection error:', err));

async function main() {
  const uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  await mongoose.connect(uri);
  console.log('Connected to DB');
}