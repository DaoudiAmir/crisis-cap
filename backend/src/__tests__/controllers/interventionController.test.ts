import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import Intervention, { InterventionStatus, InterventionType, InterventionPriority } from '../../models/Intervention';

describe('Intervention Controller', () => {
  let token: string;
  let officerToken: string;
  let teamLeaderToken: string;

  beforeEach(async () => {
    const { token: userToken } = await global.createTestUser('user');
    const { token: officerUserToken } = await global.createTestUser('officer');
    const { token: teamLeaderUserToken } = await global.createTestUser('team-leader');
    token = userToken;
    officerToken = officerUserToken;
    teamLeaderToken = teamLeaderUserToken;
  });

  describe('GET /api/interventions', () => {
    it('should return all interventions for officers', async () => {
      // Create test interventions
      await Intervention.create([
        {
          code: 'INT001',
          title: 'Fire at Commercial Building',
          description: 'Fire reported at a commercial building in downtown area',
          status: InterventionStatus.IN_PROGRESS,
          type: InterventionType.FIRE,
          priority: InterventionPriority.HIGH,
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566],
            address: '123 Example Street, Paris'
          },
          region: new mongoose.Types.ObjectId(),
          station: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          commander: new mongoose.Types.ObjectId(),
          riskLevel: 'high',
          createdBy: new mongoose.Types.ObjectId()
        },
        {
          code: 'INT002',
          title: 'Traffic Accident',
          description: 'Multiple vehicle collision on highway',
          status: InterventionStatus.DISPATCHED,
          type: InterventionType.ACCIDENT,
          priority: InterventionPriority.MEDIUM,
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566],
            address: 'Highway A1, Exit 5'
          },
          region: new mongoose.Types.ObjectId(),
          station: new mongoose.Types.ObjectId(),
          startTime: new Date(),
          commander: new mongoose.Types.ObjectId(),
          riskLevel: 'medium',
          createdBy: new mongoose.Types.ObjectId()
        }
      ]);

      const response = await request(app)
        .get('/api/interventions')
        .set('Authorization', `Bearer ${officerToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.interventions).toHaveLength(2);
      expect(response.body.data.interventions[0].title).toBe('Fire at Commercial Building');
      expect(response.body.data.interventions[1].title).toBe('Traffic Accident');
    });

    it('should allow team leaders to view interventions', async () => {
      const response = await request(app)
        .get('/api/interventions')
        .set('Authorization', `Bearer ${teamLeaderToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /api/interventions', () => {
    it('should create a new intervention when officer', async () => {
      const interventionData = {
        title: 'New Emergency',
        description: 'New emergency situation requiring response',
        type: InterventionType.MEDICAL,
        priority: InterventionPriority.HIGH,
        location: {
          coordinates: [2.3522, 48.8566],
          address: '456 Test Street, Lyon'
        },
        region: new mongoose.Types.ObjectId().toString(),
        station: new mongoose.Types.ObjectId().toString(),
        commander: new mongoose.Types.ObjectId().toString(),
        riskLevel: 'medium'
      };

      const response = await request(app)
        .post('/api/interventions')
        .set('Authorization', `Bearer ${officerToken}`)
        .send(interventionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.intervention.title).toBe('New Emergency');
      expect(response.body.data.intervention.code).toBeDefined();

      const intervention = await Intervention.findById(response.body.data.intervention._id);
      expect(intervention).toBeTruthy();
      expect(intervention!.title).toBe('New Emergency');
    });

    it('should not allow regular users to create interventions', async () => {
      const interventionData = {
        title: 'New Emergency',
        description: 'New emergency situation requiring response',
        type: InterventionType.MEDICAL,
        priority: InterventionPriority.HIGH,
        location: {
          coordinates: [2.3522, 48.8566],
          address: '456 Test Street, Lyon'
        },
        region: new mongoose.Types.ObjectId().toString(),
        station: new mongoose.Types.ObjectId().toString(),
        commander: new mongoose.Types.ObjectId().toString(),
        riskLevel: 'medium'
      };

      await request(app)
        .post('/api/interventions')
        .set('Authorization', `Bearer ${token}`)
        .send(interventionData)
        .expect(403);
    });
  });

  describe('GET /api/interventions/:id', () => {
    it('should return an intervention by id', async () => {
      const intervention = await Intervention.create({
        code: 'INT003',
        title: 'Test Intervention',
        description: 'Test intervention description',
        status: InterventionStatus.PENDING,
        type: InterventionType.RESCUE,
        priority: InterventionPriority.HIGH,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '789 Test Avenue, Marseille'
        },
        region: new mongoose.Types.ObjectId(),
        station: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        commander: new mongoose.Types.ObjectId(),
        riskLevel: 'low',
        createdBy: new mongoose.Types.ObjectId()
      });

      const response = await request(app)
        .get(`/api/interventions/${intervention._id}`)
        .set('Authorization', `Bearer ${teamLeaderToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.intervention.title).toBe('Test Intervention');
    });

    it('should return 404 for non-existent intervention', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/interventions/${nonExistentId}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/interventions/:id', () => {
    it('should update an intervention when officer', async () => {
      const intervention = await Intervention.create({
        code: 'INT004',
        title: 'Update Test',
        description: 'Intervention to be updated',
        status: InterventionStatus.PENDING,
        type: InterventionType.FIRE,
        priority: InterventionPriority.MEDIUM,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '101 Update Street, Toulouse'
        },
        region: new mongoose.Types.ObjectId(),
        station: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        commander: new mongoose.Types.ObjectId(),
        riskLevel: 'medium',
        createdBy: new mongoose.Types.ObjectId()
      });

      const response = await request(app)
        .put(`/api/interventions/${intervention._id}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ 
          title: 'Updated Intervention',
          status: InterventionStatus.IN_PROGRESS
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.intervention.title).toBe('Updated Intervention');
      expect(response.body.data.intervention.status).toBe(InterventionStatus.IN_PROGRESS);

      const updatedIntervention = await Intervention.findById(intervention._id);
      expect(updatedIntervention!.title).toBe('Updated Intervention');
      expect(updatedIntervention!.status).toBe(InterventionStatus.IN_PROGRESS);
    });

    it('should allow team leaders to update status only', async () => {
      const intervention = await Intervention.create({
        code: 'INT005',
        title: 'Team Leader Update Test',
        description: 'Intervention for team leader update test',
        status: InterventionStatus.DISPATCHED,
        type: InterventionType.MEDICAL,
        priority: InterventionPriority.LOW,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '202 Team Leader Street, Nice'
        },
        region: new mongoose.Types.ObjectId(),
        station: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        commander: new mongoose.Types.ObjectId(),
        riskLevel: 'low',
        createdBy: new mongoose.Types.ObjectId()
      });

      const response = await request(app)
        .put(`/api/interventions/${intervention._id}/status`)
        .set('Authorization', `Bearer ${teamLeaderToken}`)
        .send({ status: InterventionStatus.ON_SITE })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.intervention.status).toBe(InterventionStatus.ON_SITE);

      const updatedIntervention = await Intervention.findById(intervention._id);
      expect(updatedIntervention!.status).toBe(InterventionStatus.ON_SITE);
    });
  });

  describe('DELETE /api/interventions/:id', () => {
    it('should delete an intervention when officer', async () => {
      const intervention = await Intervention.create({
        code: 'INT006',
        title: 'Delete Test',
        description: 'Intervention to be deleted',
        status: InterventionStatus.COMPLETED,
        type: InterventionType.RESCUE,
        priority: InterventionPriority.LOW,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '303 Delete Avenue, Bordeaux'
        },
        region: new mongoose.Types.ObjectId(),
        station: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        endTime: new Date(),
        commander: new mongoose.Types.ObjectId(),
        riskLevel: 'low',
        createdBy: new mongoose.Types.ObjectId()
      });

      await request(app)
        .delete(`/api/interventions/${intervention._id}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .expect(204);

      const deletedIntervention = await Intervention.findById(intervention._id);
      expect(deletedIntervention).toBeNull();
    });

    it('should not allow team leaders to delete interventions', async () => {
      const intervention = await Intervention.create({
        code: 'INT007',
        title: 'No Delete Test',
        description: 'Intervention that should not be deleted by team leader',
        status: InterventionStatus.COMPLETED,
        type: InterventionType.ACCIDENT,
        priority: InterventionPriority.MEDIUM,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '404 No Delete Road, Lille'
        },
        region: new mongoose.Types.ObjectId(),
        station: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        endTime: new Date(),
        commander: new mongoose.Types.ObjectId(),
        riskLevel: 'medium',
        createdBy: new mongoose.Types.ObjectId()
      });

      await request(app)
        .delete(`/api/interventions/${intervention._id}`)
        .set('Authorization', `Bearer ${teamLeaderToken}`)
        .expect(403);

      const notDeletedIntervention = await Intervention.findById(intervention._id);
      expect(notDeletedIntervention).toBeTruthy();
    });
  });
});
