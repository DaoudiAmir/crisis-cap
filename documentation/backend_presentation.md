# Crisis-Cap Backend Presentation

## 1. Project Overview

Crisis-Cap is a comprehensive crisis management platform designed specifically for French firefighting services (Sapeurs-Pompiers). The platform enables real-time coordination, resource management, and emergency response optimization across multiple levels of the firefighting hierarchy.

### Key Features

- **Real-time coordination** between different roles (Firefighters, Team Leaders, Officers, Regional Coordinators)
- **Resource management** for vehicles, equipment, and personnel
- **Intervention tracking** with status updates and timeline management
- **Location-based services** for emergency response optimization
- **Role-based access control** following French firefighting hierarchy
- **Predictive analytics** for resource allocation and intervention forecasting

## 2. Technical Architecture

### Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io
- **Authentication**: JWT-based with role-based access control
- **API Documentation**: OpenAPI/Swagger
- **Testing**: Jest & Supertest
- **Code Quality**: ESLint, TypeScript (strict mode)
- **Logging**: Winston

### Project Structure

```
backend/
├── src/                  # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── validation/     # Request validation schemas
├── tests/              # Test files
└── scripts/           # Utility scripts
```

## 3. Core Models

### User Model

The User model represents all personnel in the system with role-based differentiation:

- **Roles**: Firefighter, Team Leader, Officer, Regional Coordinator, Logistics Manager
- **Features**: Location tracking, status management, team assignment, certification tracking
- **Security**: Password hashing, role-based permissions

### Intervention Model

The Intervention model represents emergency incidents:

- **Types**: Fire, Accident, Medical, Rescue, Hazmat, Natural Disaster
- **Features**: Status tracking, resource assignment, timeline events, risk assessment
- **Coordination**: Team assignment, commander designation, notes and communication

### Team Model

The Team model represents operational units:

- **Features**: Member management, vehicle assignment, status tracking
- **Coordination**: Intervention assignment, role designation

### Vehicle & Equipment Models

These models represent physical resources:

- **Features**: Status tracking, maintenance scheduling, assignment management
- **Logistics**: Inventory management, availability tracking

### Station & Region Models

These models represent organizational units:

- **Features**: Resource capacity, personnel assignment, geographical boundaries
- **Management**: Resource allocation, intervention jurisdiction

## 4. API Structure

### Authentication Endpoints

- `POST /api/auth/login`: User authentication
- `POST /api/auth/refresh`: Token refresh
- `GET /api/auth/me`: Current user info

### User Management

- `GET /api/users`: List users (with filtering)
- `POST /api/users`: Create user (admin only)
- `GET /api/users/:id`: Get user details
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user (admin only)

### Intervention Management

- `GET /api/interventions`: List interventions (with filtering)
- `POST /api/interventions`: Create intervention (officer+)
- `GET /api/interventions/:id`: Get intervention details
- `PUT /api/interventions/:id`: Update intervention
- `PUT /api/interventions/:id/status`: Update intervention status
- `POST /api/interventions/:id/resources`: Assign resources
- `POST /api/interventions/:id/timeline`: Add timeline event
- `DELETE /api/interventions/:id`: Delete intervention (officer+)

### Team Management

- `GET /api/teams`: List teams
- `POST /api/teams`: Create team (officer+)
- `GET /api/teams/:id`: Get team details
- `PUT /api/teams/:id`: Update team
- `POST /api/teams/:id/members`: Add team members
- `DELETE /api/teams/:id`: Delete team (officer+)

### Resource Management (Vehicles & Equipment)

- `GET /api/vehicles`: List vehicles
- `POST /api/vehicles`: Create vehicle (logistics+)
- `GET /api/vehicles/:id`: Get vehicle details
- `PUT /api/vehicles/:id`: Update vehicle
- `DELETE /api/vehicles/:id`: Delete vehicle (logistics+)

Similar endpoints exist for equipment, stations, and regions.

## 5. Security Implementation

### Authentication

- JWT-based authentication with refresh tokens
- Password hashing using bcrypt
- Role-based access control

### Request Validation

- Input validation using Yup schemas
- Request sanitization to prevent injection attacks

### API Security

- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- MongoDB query sanitization

## 6. Real-time Features

### Socket.io Implementation

- Real-time status updates for interventions
- Location tracking for personnel and vehicles
- Emergency alerts and notifications
- Team communication channels

### Event-Based Architecture

- Event emitters for status changes
- Subscription-based updates
- Room-based communication for teams and interventions

## 7. Testing Strategy

### Unit Tests

- Controller tests for API endpoints
- Service tests for business logic
- Model tests for validation and methods

### Integration Tests

- API endpoint testing with database integration
- Authentication flow testing
- Role-based permission testing

### Test Environment

- MongoDB Memory Server for isolated testing
- JWT mocking for authentication
- Test helpers for common operations

## 8. Deployment & DevOps

### Environment Configuration

- Environment-based configuration
- Secrets management
- Logging configuration

### Deployment Options

- Docker containerization
- CI/CD pipeline integration
- Monitoring and alerting

## 9. Current Progress & Next Steps

### Completed Features

- Authentication system
- User management
- Basic intervention management
- Team coordination
- Station and region management

### In Progress

- Real-time communication
- Advanced filtering and search
- Reporting and analytics
- Predictive resource allocation

### Future Enhancements

- Mobile app integration
- Offline capabilities
- Multi-agency coordination
- Advanced analytics and reporting

## 10. Demo Scenarios

### Scenario 1: Emergency Response Coordination

1. Emergency call received and transcribed
2. Officer creates intervention
3. Teams and resources assigned
4. Real-time status updates as teams respond
5. Timeline events recorded
6. Intervention completion and reporting

### Scenario 2: Resource Management

1. Logistics officer updates equipment status
2. Maintenance scheduling
3. Resource allocation optimization
4. Inventory tracking and alerts

### Scenario 3: Regional Coordination

1. Multiple interventions management
2. Cross-station resource allocation
3. Regional overview and reporting
4. Predictive resource needs

## 11. Testing Demonstration

The backend includes comprehensive testing using Jest and Supertest:

- **Unit Tests**: Testing individual components
- **Integration Tests**: Testing API endpoints
- **Authentication Tests**: Verifying security measures
- **Mock Data**: Using test fixtures for consistent testing

Example test command:
```bash
npm test
```

## 12. Questions & Discussion

- Architecture decisions and trade-offs
- Scaling considerations
- Security implementation details
- Real-time performance optimization
- Future development roadmap
