import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { Server as SocketServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import { logger, stream } from '../utils/logger';

// Import routes
import userRoutes from '../routes/userRoutes';
import stationRoutes from '../routes/stationRoutes';
import teamRoutes from '../routes/teamRoutes';
import equipmentRoutes from '../routes/equipmentRoutes';

import { errorHandler, notFound } from '../middleware/errorHandler';
import type { SocketService } from '../services/SocketService';
import { default as socketService } from '../services/SocketService';

export class AppServer {
  public app: Application;
  private server: HTTPServer;
  private io: SocketServer;
  private socketService: SocketService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
    });
    socketService.initialize(this.server);
    this.socketService = socketService;
    this.configureMiddleware();
    this.configureRoutes();
    this.configureSockets();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    });
    this.app.use('/api', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Data sanitization
    this.app.use(mongoSanitize());

    // Compression
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev', { stream }));
    } else {
      this.app.use(morgan('combined', { stream }));
    }

    // Make io accessible to routes
    this.app.set('io', this.io);
    this.app.set('socketService', this.socketService);
  }

  private configureRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    // API Routes
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/stations', stationRoutes);
    this.app.use('/api/v1/teams', teamRoutes);
    this.app.use('/api/v1/equipment', equipmentRoutes);

    // 404 handler for undefined routes
    this.app.all('*', notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  private configureSockets(): void {
    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);

      // Join room based on user role
      socket.on('join:role', (role: string) => {
        socket.join(`role:${role}`);
        logger.info(`Socket ${socket.id} joined role room: ${role}`);
      });

      // Join room based on station
      socket.on('join:station', (stationId: string) => {
        socket.join(`station:${stationId}`);
        logger.info(`Socket ${socket.id} joined station room: ${stationId}`);
      });

      // Join room based on team
      socket.on('join:team', (teamId: string) => {
        socket.join(`team:${teamId}`);
        logger.info(`Socket ${socket.id} joined team room: ${teamId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public start(port: number): void {
    this.server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }

  public getSocketService(): SocketService {
    return this.socketService;
  }
}

export default AppServer;
