import { Schema, model, Document, Types } from 'mongoose';

export enum EquipmentType {
  FIRE_EXTINGUISHER = 'FIRE_EXTINGUISHER',
  HOSE = 'HOSE',
  LADDER = 'LADDER',
  BREATHING_APPARATUS = 'BREATHING_APPARATUS',
  PROTECTIVE_GEAR = 'PROTECTIVE_GEAR',
  MEDICAL_KIT = 'MEDICAL_KIT',
  COMMUNICATION_DEVICE = 'COMMUNICATION_DEVICE',
  RESCUE_TOOL = 'RESCUE_TOOL',
  HAZMAT_SUIT = 'HAZMAT_SUIT',
  OTHER = 'OTHER'
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface IMaintenanceRecord {
  type: string;
  description: string;
  date: Date;
  performedBy: Types.ObjectId;
  notes?: string;
}

export interface IEquipment extends Document {
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  description?: string;
  serialNumber: string;
  purchaseDate?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  station?: Types.ObjectId;
  currentVehicle?: Types.ObjectId;
  currentUser?: Types.ObjectId;
  maintenanceHistory: IMaintenanceRecord[];
  isAvailable: boolean;
  lastStatusUpdate: Date;
}

const maintenanceRecordSchema = new Schema<IMaintenanceRecord>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String
});

const equipmentSchema = new Schema<IEquipment>({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(EquipmentType),
    required: [true, 'Equipment type is required']
  },
  status: {
    type: String,
    enum: Object.values(EquipmentStatus),
    default: EquipmentStatus.AVAILABLE
  },
  description: String,
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true
  },
  purchaseDate: Date,
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  station: {
    type: Schema.Types.ObjectId,
    ref: 'Station'
  },
  currentVehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  currentUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  maintenanceHistory: [maintenanceRecordSchema],
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to check if equipment is available
equipmentSchema.virtual('isAvailable').get(function(this: IEquipment) {
  return this.status === EquipmentStatus.AVAILABLE;
});

// Pre-save middleware to update lastStatusUpdate
equipmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

export default model<IEquipment>('Equipment', equipmentSchema);
