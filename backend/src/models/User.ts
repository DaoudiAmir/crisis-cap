import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  FIREFIGHTER = 'sapeur-pompier',
  TEAM_LEADER = 'chef-agres',
  OFFICER = 'officier',
  REGIONAL_COORDINATOR = 'coordinateur-regional',
  LOGISTICS_MANAGER = 'logistic-officer'
}

export enum UserStatus {
  AVAILABLE = 'available',
  ON_DUTY = 'on_duty',
  ON_BREAK = 'on_break',
  OFF_DUTY = 'off_duty',
  ON_LEAVE = 'on_leave'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  badgeNumber: string;
  station: Schema.Types.ObjectId;
  department: string;
  region: Schema.Types.ObjectId;
  team?: Schema.Types.ObjectId;
  specializations: string[];
  certifications: Array<{
    name: string;
    issuedDate: Date;
    expiryDate: Date;
  }>;
  location?: {
    type: string;
    coordinates: [number, number];
    lastUpdated: Date;
  };
  contactInfo: {
    phone: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  availability: {
    startTime: Date;
    endTime: Date;
    isOnCall: boolean;
  };
  currentIntervention?: Schema.Types.ObjectId;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLocation(coordinates: [number, number]): Promise<void>;
  updateStatus(status: UserStatus): Promise<void>;
  assignToTeam(teamId: Schema.Types.ObjectId): Promise<void>;
  assignToIntervention(interventionId: Schema.Types.ObjectId): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.OFF_DUTY,
    },
    badgeNumber: {
      type: String,
      required: [true, 'Badge number is required'],
      unique: true,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station assignment is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'Region is required'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    specializations: [{
      type: String,
      trim: true,
    }],
    certifications: [{
      name: { type: String, required: true },
      issuedDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
      emergencyContact: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
      },
    },
    availability: {
      startTime: { type: Date },
      endTime: { type: Date },
      isOnCall: { type: Boolean, default: false },
    },
    currentIntervention: {
      type: Schema.Types.ObjectId,
      ref: 'Intervention',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ badgeNumber: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ station: 1 });
userSchema.index({ region: 1 });
userSchema.index({ team: 1 });
userSchema.index({ currentIntervention: 1 });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.updateLocation = async function (coordinates: [number, number]): Promise<void> {
  this.location = {
    type: 'Point',
    coordinates,
    lastUpdated: new Date(),
  };
  await this.save();
};

userSchema.methods.updateStatus = async function (status: UserStatus): Promise<void> {
  this.status = status;
  await this.save();
};

userSchema.methods.assignToTeam = async function (teamId: Schema.Types.ObjectId): Promise<void> {
  this.team = teamId;
  await this.save();
};

userSchema.methods.assignToIntervention = async function (interventionId: Schema.Types.ObjectId): Promise<void> {
  this.currentIntervention = interventionId;
  this.status = UserStatus.ON_DUTY;
  await this.save();
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
