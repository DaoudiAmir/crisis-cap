# Crisis Management Platform - Backend

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Testing**: Jest & Supertest
- **Documentation**: OpenAPI/Swagger
- **Code Quality**: ESLint, Prettier
- **Type Safety**: TypeScript

## Project Structure
```
backend/
├── src/                  # Source code
│   ├── config/          # Configuration files
│   │   ├── database.ts  # Database configuration
│   │   └── server.ts    # Server configuration
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   │   ├── auth.ts     # Authentication middleware
│   │   └── error.ts    # Error handling middleware
│   ├── utils/          # Helper functions
│   ├── services/       # Business logic
│   └── types/          # TypeScript types
├── tests/              # Test files
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
└── scripts/           # Utility scripts
```

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## Installation

1. Install dependencies
```bash
cd backend
npm install
```

2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start Development Server
```bash
npm run dev
```

4. Run Tests
```bash
npm test
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development Progress

### Sprint 1: Foundation (In Progress)
- [x] Project initialization
- [x] Environment setup
- [ ] Database connection
- [ ] Basic user model
- [ ] Authentication system
- [ ] Core CRUD operations

### Upcoming Sprints
- Sprint 2: Core Features
- Sprint 3: Advanced Features
- Sprint 4: Production Readiness

## API Documentation
Once the server is running, API documentation will be available at:
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crisis-cap

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:3001

# Optional Services
REDIS_URI=redis://localhost:6379
```

## Error Handling
The application uses a centralized error handling mechanism. All errors are processed through the `errorHandler` middleware.

## Logging
We use Winston for logging with different levels based on the environment:
- Development: Console logging with detailed information
- Production: File logging with error reporting

## Testing Strategy
- Unit Tests: Individual components and functions
- Integration Tests: API endpoints and database operations
- E2E Tests: Complete user flows (planned for Sprint 2)

## Security Measures
- JWT Authentication
- Request Rate Limiting
- Input Validation
- Security Headers (Helmet)
- CORS Configuration
- Password Hashing (bcrypt)

## Contributing
Please read the main project's Contributing Guidelines before submitting any changes.

## Support
For backend-specific issues, please create an issue in the repository with the 'backend' label.
