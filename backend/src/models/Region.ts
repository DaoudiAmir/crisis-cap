import mongoose, { Document, Schema } from 'mongoose';

export interface IRegion extends Document {
  name: string;
  coordinates: { number: number }[]; // Array to store polygon or latlng array
  createdAt: Date;
  updatedAt: Date;
  fetchResourcesInRegion(vehicleId: string): Promise<void>;
  assignResourceToRegion(resourceId: string, regionId: string): Promise<void>;
}

const regionSchema = new Schema<IRegion>(
  {
    name: {
      type: String,
      required: [true, 'Region name is required'],
      trim: true
    },
    coordinates: [{
      type: Map,
      of: Number,
      required: [true, 'Region coordinates are required']
    }],
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
regionSchema.methods.fetchResourcesInRegion = async function(vehicleId: string): Promise<void> {
  // Implementation will be added in the service layer
};

regionSchema.methods.assignResourceToRegion = async function(resourceId: string, regionId: string): Promise<void> {
  // Implementation will be added in the service layer
};

const Region = mongoose.model<IRegion>('Region', regionSchema);

export default Region;
