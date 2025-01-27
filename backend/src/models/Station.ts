import mongoose, { Document, Schema } from 'mongoose';

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
      },
      vehicles: {
        type: Number,
        required: [true, 'Vehicle capacity is required'],
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
      },
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

// Index for geospatial queries
stationSchema.index({ 'address.coordinates': '2d' });

const Station = mongoose.model<IStation>('Station', stationSchema);

export default Station;
