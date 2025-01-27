import mongoose, { Document, Schema } from 'mongoose';
import { IRegion } from './Region';

export enum VehicleType {
  AMBULANCE = 'ambulance',
  FIRE_TRUCK = 'fire_truck'
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance'
}

export interface IVehicle extends Document {
  type: VehicleType;
  status: VehicleStatus;
  location: {
    type: string;
    coordinates: [number, number];
  };
  region: IRegion['_id'];
  createdAt: Date;
  updatedAt: Date;
  assignToIntervention(interventionId: string): Promise<void>;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    type: {
      type: String,
      enum: Object.values(VehicleType),
      required: [true, 'Vehicle type is required']
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.AVAILABLE
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
      required: [true, 'Region is required']
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

// Index for geospatial queries
vehicleSchema.index({ location: '2dsphere' });

// Methods
vehicleSchema.methods.assignToIntervention = async function(interventionId: string): Promise<void> {
  // Implementation will be added in the service layer
};

const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
