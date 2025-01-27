import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import { logger, stream } from '../utils/logger';
import userRoutes from '../routes/userRoutes';
import { errorHandler, notFound } from '../middleware/errorHandler';

export class AppServer {
  public app: Application;
  private server: HTTPServer;
  private io: SocketServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001',
        methods: ['GET', 'POST'],
      },
    });
    this.configureMiddleware();
    this.configureRoutes();
    this.configureSockets();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use(morgan('combined', { stream }));

    // Make io accessible to routes
    this.app.set('io', this.io);
  }

  private configureRoutes(): void {
    // API Routes
    this.app.use('/api/users', userRoutes);

    // 404 handler for undefined routes
    this.app.all('*', notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  private configureSockets(): void {
    this.io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Handle real-time location updates
      socket.on('location-update', (data) => {
        this.io.emit('location-updated', data);
      });

      // Handle intervention status changes
      socket.on('intervention-status-change', (data) => {
        this.io.emit('intervention-updated', data);
      });

      // Handle resource alerts
      socket.on('resource-alert', (data) => {
        this.io.emit('resource-alert-broadcast', data);
      });
    });
  }

  public start(port: number): void {
    this.server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }
}

export default AppServer;
