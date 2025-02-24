import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IVehicle } from './Vehicle';

export enum InterventionStatus {
  PENDING = 'pending',
  DISPATCHED = 'dispatched',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InterventionType {
  FIRE = 'fire',
  ACCIDENT = 'accident',
  MEDICAL = 'medical',
  RESCUE = 'rescue',
  HAZMAT = 'hazmat',
  NATURAL_DISASTER = 'natural_disaster'
}

export enum InterventionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface IIntervention extends Document {
  code: string;  // Unique intervention code
  title: string;
  description: string;
  status: InterventionStatus;
  type: InterventionType;
  priority: InterventionPriority;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
    accessInstructions?: string;
  };
  region: Schema.Types.ObjectId;  // Reference to Region
  station: Schema.Types.ObjectId;  // Reference to Station
  startTime: Date;
  endTime?: Date;
  estimatedDuration?: number;  // in minutes
  
  // Teams and Resources
  commander: Schema.Types.ObjectId;  // Reference to User (Officer in charge)
  teams: Array<{
    teamId: Schema.Types.ObjectId;
    role: string;
    assignedAt: Date;
  }>;
  resources: Array<{
    resourceId: Schema.Types.ObjectId;
    resourceType: 'User' | 'Vehicle';
    status: 'assigned' | 'en_route' | 'on_site' | 'returning';
    assignedAt: Date;
    arrivedAt?: Date;
  }>;
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  hazards: string[];
  weatherConditions: {
    temperature?: number;
    windSpeed?: number;
    windDirection?: string;
    precipitation?: string;
    visibility?: string;
  };
  
  // Communication
  transcripts: Array<{
    timestamp: Date;
    content: string;
    source: string;
  }>;
  notes: Array<{
    timestamp: Date;
    content: string;
    author: Schema.Types.ObjectId;
  }>;
  
  // Timeline
  timeline: Array<{
    timestamp: Date;
    event: string;
    details?: string;
    recordedBy: Schema.Types.ObjectId;
  }>;
  
  // Metadata
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addResourceToIntervention(resourceId: string, resourceType: 'User' | 'Vehicle'): Promise<void>;
  removeResourceFromIntervention(resourceId: string): Promise<void>;
  updateStatus(status: InterventionStatus): Promise<void>;
  addTimelineEvent(event: string, details?: string, recordedBy?: Schema.Types.ObjectId): Promise<void>;
  addNote(content: string, author: Schema.Types.ObjectId): Promise<void>;
  updateLocation(coordinates: [number, number], address: string): Promise<void>;
  calculateEstimatedDuration(): Promise<number>;
  fetchTranscripts(): Promise<any[]>;
}

const interventionSchema = new Schema<IIntervention>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Intervention title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(InterventionStatus),
      default: InterventionStatus.PENDING
    },
    type: {
      type: String,
      enum: Object.values(InterventionType),
      required: [true, 'Intervention type is required']
    },
    priority: {
      type: String,
      enum: Object.values(InterventionPriority),
      required: [true, 'Priority is required']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: {
        type: String,
        required: true
      },
      accessInstructions: String
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    estimatedDuration: Number,
    commander: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teams: [{
      teamId: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
      },
      role: String,
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }],
    resources: [{
      resourceId: {
        type: Schema.Types.ObjectId,
        refPath: 'resources.resourceType'
      },
      resourceType: {
        type: String,
        enum: ['User', 'Vehicle'],
        required: true
      },
      status: {
        type: String,
        enum: ['assigned', 'en_route', 'on_site', 'returning'],
        default: 'assigned'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      },
      arrivedAt: Date
    }],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme'],
      required: true
    },
    hazards: [String],
    weatherConditions: {
      temperature: Number,
      windSpeed: Number,
      windDirection: String,
      precipitation: String,
      visibility: String
    },
    transcripts: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      content: String,
      source: String
    }],
    notes: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      content: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    timeline: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      event: {
        type: String,
        required: true
      },
      details: String,
      recordedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
interventionSchema.index({ location: '2dsphere' });
interventionSchema.index({ code: 1 }, { unique: true });
interventionSchema.index({ status: 1 });
interventionSchema.index({ type: 1 });
interventionSchema.index({ priority: 1 });
interventionSchema.index({ region: 1 });
interventionSchema.index({ station: 1 });
interventionSchema.index({ commander: 1 });
interventionSchema.index({ 'resources.resourceId': 1 });
interventionSchema.index({ startTime: 1 });
interventionSchema.index({ createdAt: 1 });

// Add compound indexes for common query patterns
interventionSchema.index({ status: 1, priority: 1, type: 1 }); // For finding interventions by status, priority and type
interventionSchema.index({ region: 1, status: 1 }); // For finding interventions by region and status
interventionSchema.index({ station: 1, status: 1 }); // For finding interventions by station and status
interventionSchema.index({ startTime: 1, endTime: 1 }); // For finding interventions by time range
interventionSchema.index({ 'resources.resourceId': 1, 'resources.status': 1 }); // For finding interventions by resource and status
interventionSchema.index({ 'teams.teamId': 1, status: 1 }); // For finding interventions by team and status
interventionSchema.index({ commander: 1, status: 1 }); // For finding interventions by commander and status

// Methods
interventionSchema.methods.addResourceToIntervention = async function(
  resourceId: string,
  resourceType: 'User' | 'Vehicle'
): Promise<void> {
  this.resources.push({
    resourceId,
    resourceType,
    status: 'assigned',
    assignedAt: new Date()
  });
  await this.save();
};

interventionSchema.methods.removeResourceFromIntervention = async function(
  resourceId: string
): Promise<void> {
  this.resources = this.resources.filter(
    resource => resource.resourceId.toString() !== resourceId
  );
  await this.save();
};

interventionSchema.methods.updateStatus = async function(
  status: InterventionStatus
): Promise<void> {
  this.status = status;
  this.addTimelineEvent(`Status updated to ${status}`);
  await this.save();
};

interventionSchema.methods.addTimelineEvent = async function(
  event: string,
  details?: string,
  recordedBy?: Schema.Types.ObjectId
): Promise<void> {
  this.timeline.push({
    timestamp: new Date(),
    event,
    details,
    recordedBy
  });
  await this.save();
};

interventionSchema.methods.addNote = async function(
  content: string,
  author: Schema.Types.ObjectId
): Promise<void> {
  this.notes.push({
    timestamp: new Date(),
    content,
    author
  });
  await this.save();
};

interventionSchema.methods.updateLocation = async function(
  coordinates: [number, number],
  address: string
): Promise<void> {
  this.location = {
    type: 'Point',
    coordinates,
    address
  };
  await this.save();
};

interventionSchema.methods.calculateEstimatedDuration = async function(): Promise<number> {
  // Implementation will depend on various factors like intervention type, resources, etc.
  // This is a placeholder for the actual implementation
  return 60; // Default 60 minutes
};

interventionSchema.methods.fetchTranscripts = async function(): Promise<any[]> {
  return this.transcripts || [];
};

// Pre-save middleware to generate intervention code
interventionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const count = await mongoose.model('Intervention').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.code = `INT-${year}${month}${day}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

const Intervention = mongoose.model<IIntervention>('Intervention', interventionSchema);

export default Intervention;
