const mongoose = require('mongoose');
const dns = require('dns');


try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
      family: 4
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    console.log('[MongoDB Warning]: Could not connect to Atlas DB. Disabling buffering for in-memory / Google Drive mode.');
    mongoose.set('bufferCommands', false);
    return null;
  }
};

module.exports = connectDB;
