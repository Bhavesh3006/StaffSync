import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync', {
      dbName: 'staffsync',
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (error.message.includes('IP that isn\'t whitelisted')) {
      console.warn(`[Action Required]: Log in to MongoDB Atlas (cloud.mongodb.com) -> Network Access -> Add IP Address -> Add Current IP or 0.0.0.0/0.`);
    } else {
      console.warn(`[Tip]: Check your MONGO_URI in backend/.env or run local MongoDB with 'npm run db:start'.`);
    }
    throw error;
  }
};

export default connectDB;