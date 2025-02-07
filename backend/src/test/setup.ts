import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import config from '../config';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

// Global test helpers
global.signToken = (userId: string, role: string = 'user') => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

global.createTestUser = async (role: string = 'user') => {
  const user = await mongoose.model('User').create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role
  });
  
  const token = global.signToken(user._id, role);
  return { user, token };
};
