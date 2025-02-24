import mongoose from 'mongoose';
import config from '../config/config';
import Equipment, { EquipmentType, EquipmentStatus } from '../models/Equipment';
import Team, { TeamType, TeamStatus } from '../models/Team';
import Vehicle, { VehicleType, VehicleStatus } from '../models/Vehicle';
import Intervention, { InterventionType, InterventionStatus, InterventionPriority } from '../models/Intervention';
import Region from '../models/Region';
import Station from '../models/Station';

// Types
interface Region {
  name: string;
  coordinates: { number: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Station {
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
  status: string;
  region: mongoose.Types.ObjectId;
}

interface Equipment {
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  station: mongoose.Types.ObjectId;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceHistory: {
    type: string;
    description: string;
    date: Date;
    performedBy: mongoose.Types.ObjectId;
    notes?: string;
  }[];
}

interface Vehicle {
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  station: mongoose.Types.ObjectId;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  capacity: {
    crew: number;
    equipment: number;
  };
  lastMaintenance: Date;
  nextMaintenance: Date;
  mileage: number;
  fuelLevel: number;
  maintenanceHistory: {
    type: string;
    description: string;
    date: Date;
    performedBy: mongoose.Types.ObjectId;
    notes?: string;
    mileage: number;
  }[];
}

interface Team {
  name: string;
  type: TeamType;
  status: TeamStatus;
  station: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
    specializations: string[];
    isLeader: boolean;
  }[];
  vehicle?: mongoose.Types.ObjectId;
  equipment: mongoose.Types.ObjectId[];
  schedule: {
    shift: string;
    startTime: Date;
    endTime: Date;
  };
  specializations: string[];
  currentIntervention?: mongoose.Types.ObjectId;
}

interface Intervention {
  code?: string;
  type: InterventionType;
  status: InterventionStatus;
  priority: InterventionPriority;
  location: {
    coordinates: [number, number];
    address: string;
  };
  description: string;
  startTime: Date;
  endTime?: Date;
  estimatedDuration?: number;
  station: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  assignedTeams: mongoose.Types.ObjectId[];
  assignedVehicles: mongoose.Types.ObjectId[];
  assignedEquipment: mongoose.Types.ObjectId[];
  timeline: {
    event: string;
    timestamp: Date;
    details?: string;
    recordedBy?: mongoose.Types.ObjectId;
  }[];
  notes: {
    content: string;
    timestamp: Date;
    author: mongoose.Types.ObjectId;
  }[];
}

// Paris regions data
const regions: Region[] = [
  {
    name: "Northeast Paris",
    coordinates: [
      { number: 48.9137 }, { number: 2.4845 },
      { number: 48.9367 }, { number: 2.3547 },
      { number: 48.9000 }, { number: 2.4000 }
    ]
  },
  {
    name: "Southeast Paris",
    coordinates: [
      { number: 48.7892 }, { number: 2.4547 },
      { number: 48.7892 }, { number: 2.3892 },
      { number: 48.7500 }, { number: 2.4000 }
    ]
  },
  {
    name: "West Paris",
    coordinates: [
      { number: 48.8922 }, { number: 2.2177 },
      { number: 48.8972 }, { number: 2.2567 },
      { number: 48.8500 }, { number: 2.2000 }
    ]
  }
];

// Equipment data based on BSPP resources
const equipmentTypes = [
  { type: EquipmentType.FIRE_EXTINGUISHER, count: 200 },
  { type: EquipmentType.HOSE, count: 150 },
  { type: EquipmentType.LADDER, count: 50 },
  { type: EquipmentType.BREATHING_APPARATUS, count: 100 },
  { type: EquipmentType.PROTECTIVE_GEAR, count: 300 },
  { type: EquipmentType.MEDICAL_KIT, count: 80 },
  { type: EquipmentType.COMMUNICATION_DEVICE, count: 120 },
  { type: EquipmentType.RESCUE_TOOL, count: 90 },
  { type: EquipmentType.HAZMAT_SUIT, count: 40 }
];

// Vehicle types based on BSPP fleet
const vehicleTypes = [
  { type: VehicleType.FIRE_ENGINE, count: 130 },
  { type: VehicleType.LADDER_TRUCK, count: 63 },
  { type: VehicleType.AMBULANCE, count: 66 },
  { type: VehicleType.COMMAND_UNIT, count: 71 },
  { type: VehicleType.HAZMAT_UNIT, count: 20 },
  { type: VehicleType.WATER_TANKER, count: 40 },
  { type: VehicleType.RESCUE_TRUCK, count: 35 },
  { type: VehicleType.UTILITY_VEHICLE, count: 50 }
];

async function generateEquipment(stationId: mongoose.Types.ObjectId): Promise<Equipment[]> {
  const equipment: Equipment[] = [];
  const currentDate = new Date();
  const usedSerialNumbers = new Set<string>();
  
  for (const type of equipmentTypes) {
    const count = Math.floor(type.count / regions.length);
    for (let i = 0; i < count; i++) {
      const purchaseDate = new Date(currentDate.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3); // Up to 3 years old
      const lastMaintenance = new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      let serialNumber;
      do {
        serialNumber = `${type.type.substring(0, 3)}-${Math.floor(Math.random() * 10000)}`;
      } while (usedSerialNumbers.has(serialNumber));
      usedSerialNumbers.add(serialNumber);
      
      equipment.push({
        name: `${type.type}-${i + 1}`,
        type: type.type,
        status: Object.values(EquipmentStatus)[Math.floor(Math.random() * Object.values(EquipmentStatus).length)],
        station: stationId,
        serialNumber,
        manufacturer: ['Rosenbauer', 'MSA Safety', 'Scott Safety', 'Draeger', 'Holmatro'][Math.floor(Math.random() * 5)],
        model: `Model-${Math.floor(Math.random() * 100)}`,
        purchaseDate,
        lastMaintenance,
        nextMaintenance: new Date(lastMaintenance.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days after last maintenance
        maintenanceHistory: [
          {
            type: 'Routine Check',
            description: 'Regular maintenance and inspection',
            date: lastMaintenance,
            performedBy: new mongoose.Types.ObjectId(),
            notes: 'All systems functioning normally'
          }
        ]
      });
    }
  }
  return equipment;
}

async function generateVehicles(stationId: mongoose.Types.ObjectId): Promise<Vehicle[]> {
  const vehicles: Vehicle[] = [];
  const currentDate = new Date();
  const usedRegistrationNumbers = new Set<string>();
  
  for (const type of vehicleTypes) {
    const count = Math.floor(type.count / regions.length);
    for (let i = 0; i < count; i++) {
      const lastMaintenance = new Date(currentDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const mileage = Math.floor(Math.random() * 50000);
      
      let registrationNumber;
      do {
        registrationNumber = `BSPP-${Math.floor(Math.random() * 10000)}`;
      } while (usedRegistrationNumbers.has(registrationNumber));
      usedRegistrationNumbers.add(registrationNumber);
      
      vehicles.push({
        name: `${type.type}-${i + 1}`,
        type: type.type,
        status: Object.values(VehicleStatus)[Math.floor(Math.random() * Object.values(VehicleStatus).length)],
        station: stationId,
        registrationNumber,
        manufacturer: ['Mercedes-Benz', 'Renault', 'Iveco', 'MAN', 'Scania'][Math.floor(Math.random() * 5)],
        model: `Model-${Math.floor(Math.random() * 100)}`,
        year: 2020 + Math.floor(Math.random() * 4),
        capacity: {
          crew: Math.floor(Math.random() * 6) + 2,
          equipment: Math.floor(Math.random() * 1000) + 500
        },
        lastMaintenance,
        nextMaintenance: new Date(lastMaintenance.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days after last maintenance
        mileage,
        fuelLevel: Math.floor(Math.random() * 100),
        maintenanceHistory: [
          {
            type: 'Routine Service',
            description: 'Regular maintenance and inspection',
            date: lastMaintenance,
            performedBy: new mongoose.Types.ObjectId(),
            notes: 'All systems checked and operational',
            mileage
          }
        ]
      });
    }
  }
  return vehicles;
}

async function generateTeams(stationId: mongoose.Types.ObjectId): Promise<Team[]> {
  const teams: Team[] = [];
  const currentDate = new Date();
  
  for (const type of Object.values(TeamType)) {
    const teamSize = Math.floor(Math.random() * 4) + 4; // 4-7 members per team
    
    teams.push({
      name: `${type} Team`,
      type: type,
      status: Object.values(TeamStatus)[Math.floor(Math.random() * Object.values(TeamStatus).length)],
      station: stationId,
      members: Array.from({ length: teamSize }, () => ({
        userId: new mongoose.Types.ObjectId(),
        role: ['Firefighter', 'Paramedic', 'Engineer', 'Commander'][Math.floor(Math.random() * 4)],
        joinedAt: new Date(currentDate.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        specializations: ['Fire Combat', 'Medical Aid', 'Technical Rescue', 'Hazmat'][Math.floor(Math.random() * 4)].split(','),
        isLeader: false
      })),
      equipment: [],
      schedule: {
        shift: ['day', 'night'][Math.floor(Math.random() * 2)],
        startTime: new Date(),
        endTime: new Date(currentDate.getTime() + 12 * 60 * 60 * 1000)
      },
      specializations: ['Fire Combat', 'Medical Aid', 'Technical Rescue', 'Hazmat']
    });
    
    // Set one member as leader
    teams[teams.length - 1].members[0].isLeader = true;
  }
  return teams;
}

async function generateInterventions(stationId: mongoose.Types.ObjectId, regionId: mongoose.Types.ObjectId): Promise<Intervention[]> {
  const interventions: Intervention[] = [];
  const numInterventions = Math.floor(Math.random() * 10) + 5; // 5-15 interventions per station

  for (let i = 0; i < numInterventions; i++) {
    const type = ['Fire Emergency', 'Medical Emergency', 'Technical Rescue', 'Hazmat Incident', 'Natural Disaster'][Math.floor(Math.random() * 5)];
    const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    interventions.push({
      code: `INT-${i + 1}`,
      type: type as InterventionType,
      status: ['in-progress', 'completed', 'pending'][Math.floor(Math.random() * 3)] as InterventionStatus,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as InterventionPriority,
      location: {
        coordinates: [48.8 + Math.random() * 0.4, 2.2 + Math.random() * 0.4],
        address: `${Math.floor(Math.random() * 100)} Sample Street`
      },
      description: `Emergency ${type} intervention`,
      startTime: startDate,
      endTime: new Date(startDate.getTime() + Math.random() * 4 * 60 * 60 * 1000), // 0-4 hours duration
      estimatedDuration: Math.random() * 4 * 60 * 60 * 1000, // 0-4 hours duration
      station: stationId,
      region: regionId,
      assignedTeams: [],
      assignedVehicles: [],
      assignedEquipment: [],
      timeline: [],
      notes: []
    });
  }
  return interventions;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Region.deleteMany({}),
      Station.deleteMany({}),
      Equipment.deleteMany({}),
      Vehicle.deleteMany({}),
      Team.deleteMany({}),
      Intervention.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create regions
    const createdRegions = await Region.insertMany(regions);
    console.log('Created regions');

    // Generate stations for each region
    for (const region of createdRegions) {
      const station = await Station.create({
        name: `Station ${region.name}`,
        code: `BSPP-${Math.floor(Math.random() * 1000)}`,
        address: {
          street: `${Math.floor(Math.random() * 100)} Sample Street`,
          city: 'Paris',
          postalCode: `750${Math.floor(Math.random() * 20) + 1}`,
          coordinates: {
            latitude: 48.8 + Math.random() * 0.4,
            longitude: 2.2 + Math.random() * 0.4
          }
        },
        department: 'Paris',
        capacity: {
          personnel: Math.floor(Math.random() * 50) + 50,
          vehicles: Math.floor(Math.random() * 10) + 10
        },
        contact: {
          phone: `+33 1 ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}`,
          email: `station.${region.name.toLowerCase().replace(/\s+/g, '.')}@bspp.paris.fr`
        },
        status: 'active',
        region: region._id
      });

      const equipment = await generateEquipment(station._id as mongoose.Types.ObjectId);
      await Equipment.insertMany(equipment);

      const vehicles = await generateVehicles(station._id as mongoose.Types.ObjectId);
      await Vehicle.insertMany(vehicles);

      const teams = await generateTeams(station._id as mongoose.Types.ObjectId);
      await Team.insertMany(teams);

      const interventions = await generateInterventions(
        station._id as mongoose.Types.ObjectId,
        region._id as mongoose.Types.ObjectId
      );
      await Intervention.insertMany(interventions);

      console.log(`Created data for station: ${station.name}`);
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
