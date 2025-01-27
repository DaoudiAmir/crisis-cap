import mongoose, { Document, Schema } from 'mongoose';
import { IIntervention } from './Intervention';

export interface ITranscription extends Document {
  interventionId: IIntervention['_id'];
  audioUrl: string;
  content: string;
  language: string;
  createdAt: Date;
  fetchByIntervention(interventionId: string): Promise<ITranscription[]>;
}

const transcriptionSchema = new Schema<ITranscription>(
  {
    interventionId: {
      type: Schema.Types.ObjectId,
      ref: 'Intervention',
      required: [true, 'Intervention reference is required']
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required']
    },
    content: {
      type: String,
      required: [true, 'Transcription content is required']
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'fr'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Static method
transcriptionSchema.statics.fetchByIntervention = async function(
  interventionId: string
): Promise<ITranscription[]> {
  return this.find({ interventionId }).sort({ createdAt: -1 });
};

const Transcription = mongoose.model<ITranscription>('Transcription', transcriptionSchema);

export default Transcription;
