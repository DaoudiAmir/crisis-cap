import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import compression from 'node:zlib';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import userRoutes from './routes/userRoutes';
import stationRoutes from './routes/stationRoutes';
import teamRoutes from './routes/teamRoutes';
import equipmentRoutes from './routes/equipmentRoutes';

import { errorHandler } from './middleware/errorHandler';
import connectDB from './config/db'; // Changed import path
import SocketService from './services/SocketService';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const socketService = new SocketService(httpServer);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/equipment', equipmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// Connect to database
connectDB();

export { app, httpServer };
