import mongoose, { Document, Schema, Types } from 'mongoose';

export enum TeamStatus {
  ACTIVE = 'active',
  ON_BREAK = 'on_break',
  OFF_DUTY = 'off_duty',
  ON_INTERVENTION = 'on_intervention',
  TRAINING = 'training'
}

export enum TeamType {
  FIRE_FIGHTING = 'fire_fighting',
  RESCUE = 'rescue',
  MEDICAL = 'medical',
  HAZMAT = 'hazmat',
  SPECIAL_OPS = 'special_ops'
}

export interface TeamMember {
  userId: Types.ObjectId;
  role: string;
  joinedAt: Date;
  specializations: string[];
  isLeader: boolean;
}

export interface ITeam extends Document {
  name: string;
  type: TeamType;
  status: TeamStatus;
  station: Types.ObjectId;
  members: TeamMember[];
  currentVehicle?: Types.ObjectId;
  currentIntervention?: Types.ObjectId;
  schedule: {
    startTime: Date;
    endTime: Date;
  };
  lastStatusUpdate: Date;
  notes: Array<{
    content: string;
    author: Types.ObjectId;
    timestamp: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(TeamType),
      required: [true, 'Team type is required'],
    },
    status: {
      type: String,
      enum: Object.values(TeamStatus),
      default: TeamStatus.OFF_DUTY,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station is required'],
    },
    members: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      specializations: [{
        type: String,
      }],
      isLeader: {
        type: Boolean,
        default: false,
      },
    }],
    currentVehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    currentIntervention: {
      type: Schema.Types.ObjectId,
      ref: 'Intervention',
    },
    schedule: {
      startTime: {
        type: Date,
        required: [true, 'Schedule start time is required'],
      },
      endTime: {
        type: Date,
        required: [true, 'Schedule end time is required'],
      },
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
    notes: [{
      content: {
        type: String,
        required: true,
      },
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teamSchema.index({ station: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ type: 1 });
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ currentVehicle: 1 });
teamSchema.index({ currentIntervention: 1 });

// Middleware to update lastStatusUpdate
teamSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

// Virtual for team size
teamSchema.virtual('size').get(function() {
  return this.members.length;
});

// Virtual for active duration
teamSchema.virtual('activeDuration').get(function() {
  return this.schedule.endTime.getTime() - this.schedule.startTime.getTime();
});

// Methods
teamSchema.methods.hasSpecialization = function(specialization: string): boolean {
  return this.members.some(member => 
    member.specializations.includes(specialization)
  );
};

teamSchema.methods.isAvailable = function(): boolean {
  return this.status !== TeamStatus.ON_INTERVENTION && 
         this.status !== TeamStatus.OFF_DUTY &&
         this.isActive;
};

teamSchema.methods.canHandleInterventionType = function(interventionType: string): boolean {
  // Map intervention types to required team types
  const typeMapping: { [key: string]: TeamType[] } = {
    'fire': [TeamType.FIRE_FIGHTING],
    'rescue': [TeamType.RESCUE],
    'medical': [TeamType.MEDICAL],
    'hazmat': [TeamType.HAZMAT],
    'special': [TeamType.SPECIAL_OPS],
  };

  return typeMapping[interventionType]?.includes(this.type as TeamType) || false;
};

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team;
