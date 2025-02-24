import { Schema, model, Document, Types } from 'mongoose';

export enum VehicleType {
  FIRE_ENGINE = 'FIRE_ENGINE',
  LADDER_TRUCK = 'LADDER_TRUCK',
  RESCUE_TRUCK = 'RESCUE_TRUCK',
  AMBULANCE = 'AMBULANCE',
  HAZMAT_UNIT = 'HAZMAT_UNIT',
  COMMAND_UNIT = 'COMMAND_UNIT',
  WATER_TANKER = 'WATER_TANKER',
  UTILITY_VEHICLE = 'UTILITY_VEHICLE',
  OTHER = 'OTHER'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_MISSION = 'ON_MISSION',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface IMaintenanceRecord {
  type: string;
  description: string;
  date: Date;
  performedBy: Types.ObjectId;
  notes?: string;
  mileage: number;
}

export interface IVehicle extends Document {
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  registrationNumber: string;
  description?: string;
  station?: Types.ObjectId;
  currentTeam?: Types.ObjectId;
  equipment: Types.ObjectId[];
  crew: Types.ObjectId[];
  maintenanceHistory: IMaintenanceRecord[];
  capacity: {
    crew: number;
    equipment: number;
  };
  specifications: {
    manufacturer: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: string;
    tankCapacity?: number;
  };
  isAvailable: boolean;
  lastStatusUpdate: Date;
}

const maintenanceRecordSchema = new Schema<IMaintenanceRecord>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
  mileage: { type: Number, required: true }
});

const vehicleSchema = new Schema<IVehicle>({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
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
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true
  },
  description: String,
  station: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  },
  currentTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  equipment: [{
    type: Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  crew: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  maintenanceHistory: [maintenanceRecordSchema],
  capacity: {
    crew: {
      type: Number,
      required: [true, 'Crew capacity is required'],
      min: 1
    },
    equipment: {
      type: Number,
      required: [true, 'Equipment capacity is required'],
      min: 0
    }
  },
  specifications: {
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required']
    },
    model: {
      type: String,
      required: [true, 'Model is required']
    },
    year: {
      type: Number,
      required: [true, 'Year is required']
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: 0
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required']
    },
    tankCapacity: Number
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to check if vehicle is available
vehicleSchema.virtual('isAvailable').get(function(this: IVehicle) {
  return this.status === VehicleStatus.AVAILABLE;
});

// Pre-save middleware to update lastStatusUpdate
vehicleSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

// Middleware to prevent exceeding capacity
vehicleSchema.pre('save', function(next) {
  if (this.isModified('crew') && this.crew.length > this.capacity.crew) {
    const err = new Error('Cannot exceed crew capacity');
    return next(err);
  }
  if (this.isModified('equipment') && this.equipment.length > this.capacity.equipment) {
    const err = new Error('Cannot exceed equipment capacity');
    return next(err);
  }
  next();
});

export default model<IVehicle>('Vehicle', vehicleSchema);
