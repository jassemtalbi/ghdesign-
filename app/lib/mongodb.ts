import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');

// Reuse connection across hot reloads in dev
const globalWithMongoose = global as typeof global & { _mongoose?: Promise<typeof mongoose> };

if (!globalWithMongoose._mongoose) {
  globalWithMongoose._mongoose = mongoose.connect(MONGODB_URI);
}

export default globalWithMongoose._mongoose;
