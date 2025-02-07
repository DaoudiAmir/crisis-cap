import { Types, Document, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';
import AppError from '../utils/AppError';
import Team from '../models/Team';
import Intervention from '../models/Intervention';

interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  badgeNumber: string;
  station: string;
  department: string;
}

interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  station?: string;
  department?: string;
  isActive?: boolean;
}

// Interface for safe user data (without password)
type SafeUser = Omit<IUser, 'password' | 'comparePassword'>;

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    badgeNumber: string;
    station: string;
    department: string;
    isActive: boolean;
  };
}

interface JwtPayload {
  _id: string;
  role: UserRole;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
  station: string;
  department: string;
}

class UserService {
  private toSafeUser(user: HydratedDocument<IUser>): Omit<IUser, 'password' | 'comparePassword'> & { _id: Types.ObjectId } {
    const userObj = user.toObject() as Omit<IUser, 'password' | 'comparePassword'> & { _id: Types.ObjectId };
    if ('password' in userObj) delete userObj.password;
    if ('comparePassword' in userObj) delete userObj.comparePassword;
    return userObj;
  }

  // Create initial admin user if no users exist
  public async createInitialAdmin(): Promise<SafeUser | null> {
    try {
      console.log('Checking for existing admin user...');
      const adminExists = await User.findOne({ role: UserRole.REGIONAL_COORDINATOR });
      console.log('Admin exists:', adminExists ? 'Yes' : 'No');

      if (adminExists) {
        console.log('Admin user already exists');
        return null;
      }

      console.log('Creating new admin user...');
      const plainPassword = 'Admin@123456';
      console.log('Plain password:', plainPassword);

      // Don't hash the password here, let the schema pre-save hook handle it
      const adminData = {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@sdis.fr',
        password: plainPassword, // Plain password, will be hashed by pre-save hook
        role: UserRole.REGIONAL_COORDINATOR,
        badgeNumber: 'ADMIN001',
        station: new Types.ObjectId(),
        department: 'System',
        isActive: true
      };
      console.log('Admin user data:', { ...adminData, password: '[HIDDEN]' });

      const adminUser = await User.create(adminData);
      console.log('Admin user created successfully');
      console.log('Created user ID:', adminUser._id);

      return this.toSafeUser(adminUser);
    } catch (error) {
      console.error('Create initial admin error:', error);
      throw error;
    }
  }

  // Create a new user
  public async createUser(userData: CreateUserDTO): Promise<SafeUser> {
    try {
      // Check if user with same email exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError('User with this email already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        station: new Types.ObjectId(userData.station),
        isActive: true
      });

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Login user
  public async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Starting login process for email:', email);
      
      // Find user with password explicitly selected
      const user = await User.findOne({ email })
        .select('+password')
        .exec();
        
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('User not found:', email);
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      console.log('User active status:', user.isActive);
      if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 401);
      }

      // Check password
      console.log('Starting password comparison');
      console.log('Stored hashed password:', user.password);
      console.log('Password to compare:', password);
      
      // Use the schema method for password comparison
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        throw new AppError('Invalid credentials', 401);
      }

      console.log('Password validation successful');

      // Update last login
      user.lastLogin = new Date();
      await user.save();
      console.log('Last login updated');

      // Generate JWT
      const token = this.generateToken(user);
      console.log('JWT token generated');
      
      const safeUser = this.toSafeUser(user);
      console.log('Safe user object created');

      return {
        token,
        user: {
          _id: safeUser._id.toString(),
          firstName: safeUser.firstName,
          lastName: safeUser.lastName,
          email: safeUser.email,
          role: safeUser.role,
          badgeNumber: safeUser.badgeNumber,
          station: safeUser.station.toString(),
          department: safeUser.department,
          isActive: safeUser.isActive
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get user by ID
  public async getUserById(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.toSafeUser(user);
  }

  // Update user
  public async updateUser(userId: string, updateData: UpdateUserDTO): Promise<SafeUser> {
    if (updateData.station) {
      updateData.station = new Types.ObjectId(updateData.station).toString();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.toSafeUser(user);
  }

  // Get users by role
  public async getUsersByRole(role: UserRole): Promise<SafeUser[]> {
    const users = await User.find({ role });
    return users.map(user => this.toSafeUser(user));
  }

  // Get users by station
  public async getUsersByStation(stationId: string): Promise<SafeUser[]> {
    const users = await User.find({ station: new Types.ObjectId(stationId) });
    return users.map(user => this.toSafeUser(user));
  }

  // Deactivate user
  public async deactivateUser(userId: string): Promise<SafeUser> {
    try {
      console.log('Deactivating user:', userId);
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.isActive) {
        throw new AppError('User is already deactivated', 400);
      }

      user.isActive = false;
      await user.save();
      console.log('User deactivated successfully');

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Reactivate user
  public async reactivateUser(userId: string): Promise<SafeUser> {
    try {
      console.log('Reactivating user:', userId);
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.isActive) {
        throw new AppError('User is already active', 400);
      }

      user.isActive = true;
      await user.save();
      console.log('User reactivated successfully');

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Reactivate user error:', error);
      throw error;
    }
  }

  private generateToken(user: HydratedDocument<IUser>): string {
    const payload: JwtPayload = {
      _id: (user._id as Types.ObjectId).toString(),
      role: user.role,
      isActive: user.isActive,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      badgeNumber: user.badgeNumber,
      station: user.station.toString(),
      department: user.department
    };

    const options: SignOptions = {
      expiresIn: '8h' // Set to 8 hours instead of using process.env
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, options);
  }

  // Update user availability
  public async updateAvailability(
    userId: string,
    status: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.availability = {
        status,
        startTime,
        endTime,
        lastUpdated: new Date()
      };

      await user.save();

      // Emit socket event
      if (socketService) {
        socketService.emitUserAvailabilityUpdated({
          userId,
          availability: user.availability
        });
      }

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Update availability error:', error);
      throw error;
    }
  }

  // Add specialization to user
  public async addSpecialization(
    userId: string,
    specializationData: {
      specialization: string;
      certificationDate: Date;
      expiryDate?: Date;
      issuedBy: string;
    }
  ): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.specializations.push({
        ...specializationData,
        issuedBy: new Types.ObjectId(specializationData.issuedBy),
        isActive: true
      });

      await user.save();
      return this.toSafeUser(user);
    } catch (error) {
      console.error('Add specialization error:', error);
      throw error;
    }
  }

  // Remove specialization from user
  public async removeSpecialization(
    userId: string,
    specializationId: string
  ): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const specializationIndex = user.specializations.findIndex(
        spec => spec._id.toString() === specializationId
      );

      if (specializationIndex === -1) {
        throw new AppError('Specialization not found', 404);
      }

      user.specializations.splice(specializationIndex, 1);
      await user.save();
      return this.toSafeUser(user);
    } catch (error) {
      console.error('Remove specialization error:', error);
      throw error;
    }
  }

  // Assign user to team
  public async assignToTeam(
    userId: string,
    teamId: string,
    role: string
  ): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if team exists
      const team = await Team.findById(teamId);
      if (!team) {
        throw new AppError('Team not found', 404);
      }

      user.team = {
        teamId: new Types.ObjectId(teamId),
        role,
        joinedAt: new Date()
      };

      await user.save();

      // Emit socket event
      if (socketService) {
        socketService.emitUserTeamUpdated({
          userId,
          team: user.team
        });
      }

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Assign to team error:', error);
      throw error;
    }
  }

  // Remove user from team
  public async removeFromTeam(userId: string): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.team = undefined;
      await user.save();

      // Emit socket event
      if (socketService) {
        socketService.emitUserTeamUpdated({
          userId,
          team: null
        });
      }

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Remove from team error:', error);
      throw error;
    }
  }

  // Get available users
  public async getAvailableUsers(
    station?: string,
    specialization?: string
  ): Promise<SafeUser[]> {
    try {
      const query: any = {
        'availability.status': 'available'
      };

      if (station) {
        query.station = new Types.ObjectId(station);
      }

      if (specialization) {
        query['specializations.specialization'] = specialization;
        query['specializations.isActive'] = true;
      }

      const users = await User.find(query);
      return users.map(user => this.toSafeUser(user));
    } catch (error) {
      console.error('Get available users error:', error);
      throw error;
    }
  }

  // Get user schedule
  public async getUserSchedule(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get interventions where user is assigned
      const interventions = await Intervention.find({
        'resources.resourceId': userId,
        'resources.resourceType': 'User',
        startTime: { $gte: new Date(startDate) },
        endTime: { $lte: new Date(endDate) }
      });

      // Get availability changes in the date range
      const availabilityChanges = user.availabilityHistory.filter(
        history => {
          const historyDate = new Date(history.timestamp);
          return historyDate >= new Date(startDate) && historyDate <= new Date(endDate);
        }
      );

      return {
        interventions,
        availabilityChanges
      };
    } catch (error) {
      console.error('Get user schedule error:', error);
      throw error;
    }
  }

  // Get user statistics
  public async getUserStats(
    station: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      const query: any = {};
      if (station) {
        query.station = new Types.ObjectId(station);
      }

      const dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };

      const users = await User.find(query);
      const userIds = users.map(user => user._id);

      // Get interventions statistics
      const interventions = await Intervention.find({
        'resources.resourceId': { $in: userIds },
        'resources.resourceType': 'User',
        startTime: dateRange
      });

      // Calculate statistics
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isActive).length,
        totalInterventions: interventions.length,
        averageInterventionsPerUser: interventions.length / users.length,
        usersByRole: {},
        interventionsByType: {}
      };

      // Group users by role
      users.forEach(user => {
        if (!stats.usersByRole[user.role]) {
          stats.usersByRole[user.role] = 0;
        }
        stats.usersByRole[user.role]++;
      });

      // Group interventions by type
      interventions.forEach(intervention => {
        if (!stats.interventionsByType[intervention.type]) {
          stats.interventionsByType[intervention.type] = 0;
        }
        stats.interventionsByType[intervention.type]++;
      });

      return stats;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Get nearby users
  public async getNearbyUsers(
    coordinates: [number, number],
    radius: number
  ): Promise<SafeUser[]> {
    try {
      const users = await User.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: radius
          }
        },
        isActive: true
      });

      return users.map(user => this.toSafeUser(user));
    } catch (error) {
      console.error('Get nearby users error:', error);
      throw error;
    }
  }

  // Update user location
  public async updateLocation(
    userId: string,
    coordinates: [number, number]
  ): Promise<SafeUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.location = {
        type: 'Point',
        coordinates
      };
      user.lastLocationUpdate = new Date();

      await user.save();

      // Emit socket event
      if (socketService) {
        socketService.emitUserLocationUpdated({
          userId,
          coordinates,
          timestamp: user.lastLocationUpdate
        });
      }

      return this.toSafeUser(user);
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }
}

export default new UserService();
