import { Types } from 'mongoose';
import Transcription, { ITranscription } from '../models/Transcription';
import Intervention from '../models/Intervention';
import AppError from '../utils/AppError';

interface CreateTranscriptionDTO {
  interventionId: string;
  audioUrl: string;
  content: string;
  language?: string;
}

class TranscriptionService {
  // Create a new transcription
  async createTranscription(data: CreateTranscriptionDTO): Promise<ITranscription> {
    try {
      // Verify intervention exists
      const intervention = await Intervention.findById(data.interventionId);
      if (!intervention) {
        throw new AppError('Intervention not found', 404);
      }

      const transcription = await Transcription.create({
        ...data,
        interventionId: new Types.ObjectId(data.interventionId),
        language: data.language || 'fr'
      });

      return transcription.toObject();
    } catch (err: any) {
      throw new AppError(err.message || 'Error creating transcription', err.statusCode || 500);
    }
  }

  // Get transcriptions for an intervention
  async getInterventionTranscriptions(interventionId: string): Promise<ITranscription[]> {
    try {
      const transcriptions = await Transcription.find({ 
        interventionId: new Types.ObjectId(interventionId) 
      }).sort({ createdAt: -1 });
      
      return transcriptions.map(doc => doc.toObject());
    } catch (err: any) {
      throw new AppError('Error fetching transcriptions', 500);
    }
  }

  // Get a single transcription by ID
  async getTranscriptionById(transcriptionId: string): Promise<ITranscription> {
    try {
      const transcription = await Transcription.findById(transcriptionId);
      if (!transcription) {
        throw new AppError('Transcription not found', 404);
      }
      return transcription.toObject();
    } catch (err: any) {
      throw new AppError(err.message || 'Error fetching transcription', err.statusCode || 500);
    }
  }

  // Delete a transcription
  async deleteTranscription(transcriptionId: string): Promise<void> {
    try {
      const transcription = await Transcription.findByIdAndDelete(transcriptionId);
      if (!transcription) {
        throw new AppError('Transcription not found', 404);
      }
    } catch (err: any) {
      throw new AppError('Error deleting transcription', 500);
    }
  }

  // Get transcriptions by language
  async getTranscriptionsByLanguage(language: string): Promise<ITranscription[]> {
    try {
      const transcriptions = await Transcription.find({ language })
        .sort({ createdAt: -1 });
      
      return transcriptions.map(doc => doc.toObject());
    } catch (err: any) {
      throw new AppError('Error fetching transcriptions by language', 500);
    }
  }

  // Bulk create transcriptions
  async bulkCreateTranscriptions(transcriptions: CreateTranscriptionDTO[]): Promise<ITranscription[]> {
    try {
      // Verify all interventions exist
      const interventionIds = [...new Set(transcriptions.map(t => t.interventionId))];
      const interventions = await Intervention.find({ _id: { $in: interventionIds } });
      
      if (interventions.length !== interventionIds.length) {
        throw new AppError('One or more interventions not found', 404);
      }

      const createdTranscriptions = await Transcription.insertMany(
        transcriptions.map(t => ({
          ...t,
          interventionId: new Types.ObjectId(t.interventionId),
          language: t.language || 'fr'
        }))
      );

      return createdTranscriptions.map(doc => doc.toObject());
    } catch (err: any) {
      throw new AppError('Error creating transcriptions in bulk', 500);
    }
  }

  // Search transcriptions by content
  async searchTranscriptions(query: string): Promise<ITranscription[]> {
    try {
      const transcriptions = await Transcription.find({
        content: { $regex: query, $options: 'i' }
      }).sort({ createdAt: -1 });

      return transcriptions.map(doc => doc.toObject());
    } catch (err: any) {
      throw new AppError('Error searching transcriptions', 500);
    }
  }
}

export default new TranscriptionService();
