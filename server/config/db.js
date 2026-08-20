const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vibeforge';
    console.log(`Attempting MongoDB connection to: ${connStr.replace(/:[^:@]+@/, ':***@')}`);
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      dbName: process.env.MONGO_DB_NAME || 'vibeforge',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}. Running in Mock Database Mode.`);
    return false;
  }
};

module.exports = connectDB;
