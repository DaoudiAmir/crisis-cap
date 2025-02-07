# Crisis Management Platform (Crisis-CAP)

## Project Overview
A comprehensive crisis management platform designed for French firefighting services (Sapeurs-Pompiers), enabling real-time coordination and resource management across multiple roles and regions.

## Technical Stack
### Backend
- Runtime: Node.js with TypeScript
- Framework: Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT
- Real-time Communication: Socket.IO
- Testing: Jest with Supertest
- API Documentation: Swagger/OpenAPI
- Logging: Winston
- Security: Helmet, Rate Limiting, CORS

### DevOps & Infrastructure
- Version Control: Git
- CI/CD: GitHub Actions
- Code Quality: ESLint, Prettier
- Container: Docker (planned)
- Monitoring: Prometheus & Grafana (planned)

## Core Features by Role

### 1. Firefighter (Sapeur-Pompier)
- Real-time intervention assignment
- Status updates (en route, on site, finished)
- GPS location sharing
- Weather information integration
- Emergency call transcription access

### 2. Chef d'Agrès (Team Leader)
- Team status monitoring
- Role assignment within crews
- Real-time communication with command center
- Intervention timeline management

### 3. Officier de Commandement
- Multi-intervention dashboard
- Resource allocation management
- AI-powered predictive alerts
- Multi-agency coordination interface

### 4. Coordonnateur Régional
- Multi-region overview dashboard
- Cross-region resource management
- Standardized dispatch orders
- Predictive modeling and analytics

### 5. Logistic Officer
- Resource inventory management
- Alert system for resource thresholds
- Vehicle maintenance scheduling
- Supply chain coordination

## Development Phases

### Phase 1: Core Infrastructure (Current)
- [x] Basic authentication system
- [x] User management with roles
- [ ] Database schema optimization
- [ ] API security hardening
- [ ] Real-time communication setup

### Phase 2: Firefighter & Team Leader Features
- [ ] Intervention management system
- [ ] Real-time location tracking
- [ ] Status update system
- [ ] Team management interface
- [ ] Weather API integration

### Phase 3: Command & Control Features
- [ ] Multi-intervention dashboard
- [ ] Resource allocation system
- [ ] Predictive alert system
- [ ] Agency coordination interface
- [ ] Regional overview system

### Phase 4: Logistics & Resource Management
- [ ] Inventory tracking system
- [ ] Vehicle management system
- [ ] Supply chain management
- [ ] Maintenance scheduling
- [ ] Resource analytics

### Phase 5: Advanced Features & Integration
- [ ] AI/ML predictions
- [ ] Call transcription system
- [ ] Cross-agency communication
- [ ] Mobile app development
- [ ] Analytics dashboard

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- TypeScript
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
cd crisis-cap/backend
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `NODE_ENV`: Environment (development/production)

## API Documentation
API documentation is available at `/api-docs` when running the server.

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
