import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[Tip]: Ensure MongoDB is running. If installed locally, you can run 'npm run db:start' or check your MONGO_URI in .env`);
  }
};

export default connectDB;

