import { Types, Document, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';
import AppError from '../utils/AppError';

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
}

export default new UserService();
