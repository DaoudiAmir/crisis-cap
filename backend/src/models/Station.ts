import mongoose, { Document, Schema } from 'mongoose';

export enum StationStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
  OFFLINE = 'OFFLINE'
}

export interface IStation extends Document {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  department: string;
  capacity: {
    personnel: number;
    vehicles: number;
  };
  contact: {
    phone: string;
    email: string;
  };
  status: StationStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<IStation>(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
      },
      coordinates: {
        latitude: {
          type: Number,
          required: [true, 'Latitude is required'],
        },
        longitude: {
          type: Number,
          required: [true, 'Longitude is required'],
        },
      },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    capacity: {
      personnel: {
        type: Number,
        required: [true, 'Personnel capacity is required'],
        min: [0, 'Personnel capacity cannot be negative'],
      },
      vehicles: {
        type: Number,
        required: [true, 'Vehicle capacity is required'],
        min: [0, 'Vehicle capacity cannot be negative'],
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(StationStatus),
      default: StationStatus.OPERATIONAL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
stationSchema.index({ 'address.coordinates': '2dsphere' });

// Create text index for search
stationSchema.index({ name: 'text', 'address.city': 'text' });

// Add compound indexes for common query patterns
stationSchema.index({ department: 1, isActive: 1 }); // For finding active stations by department
stationSchema.index({ 'address.city': 1, isActive: 1 }); // For finding active stations by city
stationSchema.index({ code: 1 }, { unique: true }); // For finding stations by unique code
stationSchema.index({ 'capacity.personnel': 1, 'capacity.vehicles': 1 }); // For finding stations by capacity

const Station = mongoose.model<IStation>('Station', stationSchema);

export default Station;
