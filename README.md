# Crisis Management Platform

## Project Overview
A comprehensive crisis management platform designed for French firefighting services (Sapeurs-Pompiers), enabling real-time coordination and resource management.

## Technical Stack
- Backend: Node.js/Express with TypeScript
- Database: MongoDB with Mongoose
- Authentication: JWT
- Real-time: Socket.io (planned)
- Testing: Jest (planned)

## Current Implementation Status

### Authentication & User Management
- User authentication with JWT
- Role-based access control
- Password encryption with bcrypt
- User activation/deactivation
- User profile management

### API Endpoints

#### Authentication
```http
POST /api/users/init         # Create initial admin user
POST /api/users/login        # User login
POST /api/users/register     # Register new user (protected)
```

#### User Management
```http
GET    /api/users/me              # Get current user profile
PUT    /api/users/:id             # Update user
GET    /api/users/role/:role      # Get users by role
GET    /api/users/station/:id     # Get users by station
PATCH  /api/users/:id/activate    # Activate user
PATCH  /api/users/:id/deactivate  # Deactivate user
```

### User Roles
- Sapeur-Pompier (Firefighter)
- Chef d'Agrès (Team Leader)
- Officier (Officer)
- Coordinateur Régional (Regional Coordinator)
- Logistic Officer

## Next Steps
1. Station Management System
   - CRUD operations for stations
   - Station capacity management
   - Equipment tracking

2. Intervention Management
   - Real-time intervention tracking
   - Resource allocation
   - Status updates

3. Real-time Features
   - Socket.io integration
   - Live status updates
   - Real-time notifications

4. Vehicle Tracking
   - Vehicle management system
   - Location tracking
   - Maintenance scheduling

5. Testing
   - Unit tests
   - Integration tests
   - E2E testing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create .env file with required environment variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation
Detailed API documentation is available in the [API.md](./docs/API.md) file.

## Contributing
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
