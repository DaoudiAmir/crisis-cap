import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import configJson from '../config';

// Load environment variables
config();

declare global {
  var signToken: (userId: string, role: string) => string;
  var createTestUser: (role: string) => Promise<{ user: any; token: string }>;
  var mongoServer: MongoMemoryServer;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
  global.mongoServer = mongo;
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (global.mongoServer) {
    await mongoose.connection.close();
    await global.mongoServer.stop();
  }
});

// Global test helpers
global.signToken = (userId: string, role: string = 'user') => {
  return jwt.sign(
    { id: userId, role },
    configJson.jwt.secret,
    { expiresIn: configJson.jwt.expiresIn }
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
