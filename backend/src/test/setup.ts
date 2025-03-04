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
  const collections = await mongoose.connection.db?.collections();
  
  if (collections) {
    for (let collection of collections) {
      await collection.deleteMany({});
    }
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
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: '1h' }
  );
};

// Mock user creation for tests
global.createTestUser = async (role: string = 'user') => {
  // Create a mock user object
  const user = {
    _id: new mongoose.Types.ObjectId().toString(),
    email: `test-${role}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: role,
    password: 'hashedPassword123'
  };
  
  // Generate token for the user
  const token = global.signToken(user._id, role);
  
  return { user, token };
};
