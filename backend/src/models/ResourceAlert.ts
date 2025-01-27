import mongoose, { Document, Schema } from 'mongoose';
import { IRegion } from './Region';

export enum ResourceType {
  FUEL = 'fuel',
  WATER = 'water',
  EQUIPMENT = 'equipment'
}

export interface IResourceAlert extends Document {
  resourceType: ResourceType;
  level: number;
  severity: number;
  triggeredAt: Date;
  regional: {
    objectId: IRegion['_id'];
  };
  createdAt: Date;
  updatedAt: Date;
  resolveAlert(): Promise<void>;
}

const resourceAlertSchema = new Schema<IResourceAlert>(
  {
    resourceType: {
      type: String,
      enum: Object.values(ResourceType),
      required: [true, 'Resource type is required']
    },
    level: {
      type: Number,
      required: [true, 'Resource level is required'],
      min: 0,
      max: 100
    },
    severity: {
      type: Number,
      required: [true, 'Alert severity is required'],
      min: 1,
      max: 5
    },
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    regional: {
      objectId: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: [true, 'Region reference is required']
      }
    },
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

// Methods
resourceAlertSchema.methods.resolveAlert = async function(): Promise<void> {
  // Implementation will be added in the service layer
};

const ResourceAlert = mongoose.model<IResourceAlert>('ResourceAlert', resourceAlertSchema);

export default ResourceAlert;
