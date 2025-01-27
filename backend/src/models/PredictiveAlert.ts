import mongoose, { Document, Schema } from 'mongoose';
import { IIntervention } from './Intervention';

export interface IPredictiveAlert extends Document {
  interventionId: IIntervention['_id'];
  predictedRiskScore: number;
  predictedOutcome: object;
  createdAt: Date;
  updatedAt: Date;
  generatePrediction(interventionId: string): Promise<void>;
  fetchPredictions(): Promise<any[]>;
}

const predictiveAlertSchema = new Schema<IPredictiveAlert>(
  {
    interventionId: {
      type: Schema.Types.ObjectId,
      ref: 'Intervention',
      required: [true, 'Intervention reference is required']
    },
    predictedRiskScore: {
      type: Number,
      required: [true, 'Predicted risk score is required'],
      min: 0,
      max: 100
    },
    predictedOutcome: {
      type: Schema.Types.Mixed,
      required: [true, 'Predicted outcome is required']
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

// Methods
predictiveAlertSchema.methods.generatePrediction = async function(
  interventionId: string
): Promise<void> {
  // Implementation will be added in the service layer
};

predictiveAlertSchema.methods.fetchPredictions = async function(): Promise<any[]> {
  // Implementation will be added in the service layer
  return [];
};

const PredictiveAlert = mongoose.model<IPredictiveAlert>('PredictiveAlert', predictiveAlertSchema);

export default PredictiveAlert;
