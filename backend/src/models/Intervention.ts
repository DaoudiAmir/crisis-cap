import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IVehicle } from './Vehicle';

export enum InterventionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum InterventionType {
  FIRE = 'fire',
  ACCIDENT = 'accident',
  MEDICAL = 'medical',
  RESCUE = 'rescue'
}

export interface IIntervention extends Document {
  _id: Schema.Types.ObjectId;
  title: string;
  status: InterventionStatus;
  type: InterventionType;
  location: {
    type: string;
    coordinates: [number, number];
  };
  region: Schema.Types.ObjectId;  // Reference to Region
  startTime: Date;
  endTime?: Date;
  resources: Array<{
    resourceId: Schema.Types.ObjectId;
    resourceType: 'User' | 'Vehicle';
  }>;
  createdAt: Date;
  updatedAt: Date;
  addResourceToIntervention(resourceId: string, resourceType: 'User' | 'Vehicle'): Promise<void>;
  fetchTranscripts(): Promise<any[]>;
}

const interventionSchema = new Schema<IIntervention>(
  {
    title: {
      type: String,
      required: [true, 'Intervention title is required'],
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: true,
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    resources: [{
      resourceId: {
        type: Schema.Types.ObjectId,
        refPath: 'resources.resourceType'
      },
      resourceType: {
        type: String,
        enum: ['User', 'Vehicle']
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for geospatial queries
interventionSchema.index({ location: '2dsphere' });

// Methods
interventionSchema.methods.addResourceToIntervention = async function(
  resourceId: string,
  resourceType: 'User' | 'Vehicle'
): Promise<void> {
  // Implementation will be added in the service layer
};

interventionSchema.methods.fetchTranscripts = async function(): Promise<any[]> {
  // Implementation will be added in the service layer
  return [];
};

const Intervention = mongoose.model<IIntervention>('Intervention', interventionSchema);

export default Intervention;
