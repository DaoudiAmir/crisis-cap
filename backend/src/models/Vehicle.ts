import mongoose, { Document, Schema } from 'mongoose';
import { IRegion } from './Region';

export enum VehicleType {
  FIRE_ENGINE = 'fire_engine',           // Fourgon Pompe Tonne (FPT)
  LADDER_TRUCK = 'ladder_truck',         // Échelle Pivotante Automatique (EPA)
  AMBULANCE = 'ambulance',               // Véhicule de Secours et d'Assistance aux Victimes (VSAV)
  WATER_TENDER = 'water_tender',         // Camion-Citerne (CCF)
  RESCUE_VEHICLE = 'rescue_vehicle',     // Véhicule de Secours Routier (VSR)
  COMMAND_UNIT = 'command_unit',         // Véhicule Poste de Commandement (VPC)
  UTILITY_VEHICLE = 'utility_vehicle',   // Véhicule Utilitaire (VU)
  HAZMAT_UNIT = 'hazmat_unit'           // Véhicule Risques Technologiques (VRT)
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  RETURNING = 'returning',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export interface IVehicle extends Document {
  code: string;                 // Vehicle identification code
  type: VehicleType;
  status: VehicleStatus;
  callSign: string;            // Radio callsign
  registration: string;        // License plate
  manufacturer: string;
  model: string;
  year: number;
  capacity: {
    crew: number;             // Maximum crew capacity
    water?: number;           // Water capacity in liters
    foam?: number;            // Foam capacity in liters
    equipment: string[];      // List of major equipment
  };
  location: {
    type: string;
    coordinates: [number, number];
    lastUpdated: Date;
    address?: string;
  };
  station: Schema.Types.ObjectId;  // Home station
  region: Schema.Types.ObjectId;   // Assigned region
  currentIntervention?: Schema.Types.ObjectId;
  crew?: Schema.Types.ObjectId[];  // Currently assigned crew members
  
  // Maintenance
  maintenanceStatus: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    mileage: number;
    engineHours: number;
    issues: Array<{
      description: string;
      reportedAt: Date;
      resolvedAt?: Date;
      severity: 'low' | 'medium' | 'high';
      status: 'open' | 'in_progress' | 'resolved';
    }>;
  };
  
  // Fuel Management
  fuel: {
    type: 'diesel' | 'gasoline';
    capacity: number;         // Total fuel capacity in liters
    current: number;         // Current fuel level in liters
    lastRefill: Date;
    consumption: number;     // Average consumption in L/100km
  };
  
  // Methods
  assignToIntervention(interventionId: string): Promise<void>;
  updateLocation(coordinates: [number, number], address?: string): Promise<void>;
  updateStatus(status: VehicleStatus): Promise<void>;
  assignCrew(crewMembers: string[]): Promise<void>;
  reportIssue(description: string, severity: 'low' | 'medium' | 'high'): Promise<void>;
  resolveIssue(issueIndex: number): Promise<void>;
  updateFuelLevel(amount: number): Promise<void>;
  recordMaintenance(mileage: number, engineHours: number): Promise<void>;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true
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
    callSign: {
      type: String,
      required: true,
      unique: true
    },
    registration: {
      type: String,
      required: true,
      unique: true
    },
    manufacturer: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    capacity: {
      crew: {
        type: Number,
        required: true
      },
      water: Number,
      foam: Number,
      equipment: [String]
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
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      address: String
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    region: {
      type: Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    currentIntervention: {
      type: Schema.Types.ObjectId,
      ref: 'Intervention'
    },
    crew: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    maintenanceStatus: {
      lastMaintenance: {
        type: Date,
        required: true
      },
      nextMaintenance: {
        type: Date,
        required: true
      },
      mileage: {
        type: Number,
        required: true
      },
      engineHours: {
        type: Number,
        required: true
      },
      issues: [{
        description: String,
        reportedAt: {
          type: Date,
          default: Date.now
        },
        resolvedAt: Date,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high']
        },
        status: {
          type: String,
          enum: ['open', 'in_progress', 'resolved'],
          default: 'open'
        }
      }]
    },
    fuel: {
      type: {
        type: String,
        enum: ['diesel', 'gasoline'],
        required: true
      },
      capacity: {
        type: Number,
        required: true
      },
      current: {
        type: Number,
        required: true
      },
      lastRefill: {
        type: Date,
        required: true
      },
      consumption: {
        type: Number,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
vehicleSchema.index({ location: '2dsphere' });
vehicleSchema.index({ code: 1 }, { unique: true });
vehicleSchema.index({ callSign: 1 }, { unique: true });
vehicleSchema.index({ registration: 1 }, { unique: true });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ station: 1 });
vehicleSchema.index({ region: 1 });
vehicleSchema.index({ currentIntervention: 1 });

// Pre-save middleware to generate vehicle code if not provided
vehicleSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    const type = this.type.split('_')[0].toUpperCase();
    const count = await mongoose.model('Vehicle').countDocuments({ type: this.type });
    this.code = `${type}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

// Methods
vehicleSchema.methods.assignToIntervention = async function(
  interventionId: string
): Promise<void> {
  this.currentIntervention = interventionId;
  this.status = VehicleStatus.IN_USE;
  await this.save();
};

vehicleSchema.methods.updateLocation = async function(
  coordinates: [number, number],
  address?: string
): Promise<void> {
  this.location = {
    type: 'Point',
    coordinates,
    lastUpdated: new Date(),
    ...(address && { address })
  };
  await this.save();
};

vehicleSchema.methods.updateStatus = async function(
  status: VehicleStatus
): Promise<void> {
  this.status = status;
  await this.save();
};

vehicleSchema.methods.assignCrew = async function(
  crewMembers: string[]
): Promise<void> {
  this.crew = crewMembers;
  await this.save();
};

vehicleSchema.methods.reportIssue = async function(
  description: string,
  severity: 'low' | 'medium' | 'high'
): Promise<void> {
  this.maintenanceStatus.issues.push({
    description,
    severity,
    reportedAt: new Date(),
    status: 'open'
  });
  await this.save();
};

vehicleSchema.methods.resolveIssue = async function(
  issueIndex: number
): Promise<void> {
  if (this.maintenanceStatus.issues[issueIndex]) {
    this.maintenanceStatus.issues[issueIndex].status = 'resolved';
    this.maintenanceStatus.issues[issueIndex].resolvedAt = new Date();
  }
  await this.save();
};

vehicleSchema.methods.updateFuelLevel = async function(
  amount: number
): Promise<void> {
  this.fuel.current = amount;
  if (amount > this.fuel.current) {
    this.fuel.lastRefill = new Date();
  }
  await this.save();
};

vehicleSchema.methods.recordMaintenance = async function(
  mileage: number,
  engineHours: number
): Promise<void> {
  this.maintenanceStatus.lastMaintenance = new Date();
  this.maintenanceStatus.nextMaintenance = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  this.maintenanceStatus.mileage = mileage;
  this.maintenanceStatus.engineHours = engineHours;
  await this.save();
};

const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
