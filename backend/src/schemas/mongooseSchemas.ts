import mongoose, { Schema } from 'mongoose';

// Region Schema
const regionSchema = new Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});

// Station Schema
const stationSchema = new Schema({
  name: { type: String, required: true },
  region: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  capacity: { type: Number, required: true },
  status: { type: String, required: true, enum: ['active', 'inactive', 'maintenance'] }
});

// Equipment Schema
const equipmentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true, enum: ['available', 'in-use', 'maintenance'] },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  lastMaintenance: { type: Date, required: true },
  nextMaintenance: { type: Date, required: true }
});

// Team Schema
const teamSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  size: { type: Number, required: true },
  status: { type: String, required: true, enum: ['active', 'standby', 'training'] },
  shift: { type: String, required: true, enum: ['day', 'night'] }
});

// Vehicle Schema
const vehicleSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true, enum: ['available', 'in-use', 'maintenance'] },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  lastMaintenance: { type: Date, required: true },
  nextMaintenance: { type: Date, required: true }
});

// Intervention Schema
const interventionSchema = new Schema({
  type: { type: String, required: true },
  status: { type: String, required: true, enum: ['in-progress', 'completed', 'pending'] },
  priority: { type: String, required: true, enum: ['high', 'medium', 'low'] },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  region: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  description: { type: String, required: true }
});

// Create and export models
export const RegionModel = mongoose.model('Region', regionSchema);
export const StationModel = mongoose.model('Station', stationSchema);
export const EquipmentModel = mongoose.model('Equipment', equipmentSchema);
export const TeamModel = mongoose.model('Team', teamSchema);
export const VehicleModel = mongoose.model('Vehicle', vehicleSchema);
export const InterventionModel = mongoose.model('Intervention', interventionSchema);
