import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crisis-cap',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export default config;
