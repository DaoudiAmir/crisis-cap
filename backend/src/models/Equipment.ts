import mongoose, { Document, Schema, Types } from 'mongoose';

export enum EquipmentType {
  BREATHING_APPARATUS = 'breathing_apparatus',
  FIRE_HOSE = 'fire_hose',
  LADDER = 'ladder',
  MEDICAL_KIT = 'medical_kit',
  RESCUE_TOOL = 'rescue_tool',
  HAZMAT_SUIT = 'hazmat_suit',
  COMMUNICATION_DEVICE = 'communication_device',
  THERMAL_CAMERA = 'thermal_camera',
  POWER_TOOL = 'power_tool',
  SPECIAL_EQUIPMENT = 'special_equipment'
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  BROKEN = 'broken',
  RETIRED = 'retired'
}

export interface MaintenanceRecord {
  type: 'inspection' | 'repair' | 'calibration' | 'cleaning';
  date: Date;
  performedBy: Types.ObjectId;
  description: string;
  cost?: number;
  nextMaintenanceDate?: Date;
}

export interface IEquipment extends Document {
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  station: Types.ObjectId;
  currentVehicle?: Types.ObjectId;
  currentUser?: Types.ObjectId;
  specifications: {
    manufacturer: string;
    manufacturingDate: Date;
    expiryDate?: Date;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    powerType?: string;
    certifications?: string[];
  };
  maintenanceHistory: MaintenanceRecord[];
  lastInspection: Date;
  nextInspectionDue: Date;
  notes: Array<{
    content: string;
    author: Types.ObjectId;
    timestamp: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(EquipmentType),
      required: [true, 'Equipment type is required'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EquipmentStatus),
      default: EquipmentStatus.AVAILABLE,
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station is required'],
    },
    currentVehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    currentUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    specifications: {
      manufacturer: {
        type: String,
        required: [true, 'Manufacturer is required'],
      },
      manufacturingDate: {
        type: Date,
        required: [true, 'Manufacturing date is required'],
      },
      expiryDate: Date,
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      powerType: String,
      certifications: [String],
    },
    maintenanceHistory: [{
      type: {
        type: String,
        enum: ['inspection', 'repair', 'calibration', 'cleaning'],
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      performedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      cost: Number,
      nextMaintenanceDate: Date,
    }],
    lastInspection: {
      type: Date,
      required: [true, 'Last inspection date is required'],
    },
    nextInspectionDue: {
      type: Date,
      required: [true, 'Next inspection due date is required'],
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
equipmentSchema.index({ station: 1 });
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ serialNumber: 1 }, { unique: true });
equipmentSchema.index({ currentVehicle: 1 });
equipmentSchema.index({ currentUser: 1 });
equipmentSchema.index({ 'specifications.expiryDate': 1 });
equipmentSchema.index({ nextInspectionDue: 1 });

// Virtual for age
equipmentSchema.virtual('age').get(function() {
  return new Date().getTime() - this.specifications.manufacturingDate.getTime();
});

// Virtual for maintenance count
equipmentSchema.virtual('maintenanceCount').get(function() {
  return this.maintenanceHistory.length;
});

// Methods
equipmentSchema.methods.isAvailable = function(): boolean {
  return this.status === EquipmentStatus.AVAILABLE && this.isActive;
};

equipmentSchema.methods.needsMaintenance = function(): boolean {
  return new Date() >= this.nextInspectionDue;
};

equipmentSchema.methods.isExpired = function(): boolean {
  return this.specifications.expiryDate && new Date() >= this.specifications.expiryDate;
};

equipmentSchema.methods.addMaintenanceRecord = function(record: MaintenanceRecord) {
  this.maintenanceHistory.push(record);
  this.lastInspection = record.date;
  if (record.nextMaintenanceDate) {
    this.nextInspectionDue = record.nextMaintenanceDate;
  }
};

const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);

export default Equipment;
