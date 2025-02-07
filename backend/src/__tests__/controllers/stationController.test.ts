import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import Station from '../../models/Station';

describe('Station Controller', () => {
  let token: string;
  let adminToken: string;

  beforeEach(async () => {
    const { token: userToken } = await global.createTestUser('user');
    const { token: adminUserToken } = await global.createTestUser('admin');
    token = userToken;
    adminToken = adminUserToken;
  });

  describe('GET /api/stations', () => {
    it('should return all stations', async () => {
      await Station.create([
        {
          name: 'Station 1',
          code: 'ST1',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566],
            address: '1 Example Street'
          },
          capacity: {
            personnel: 50,
            vehicles: 10,
            equipment: 100
          },
          type: 'fire'
        },
        {
          name: 'Station 2',
          code: 'ST2',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566],
            address: '2 Example Street'
          },
          capacity: {
            personnel: 30,
            vehicles: 5,
            equipment: 50
          },
          type: 'medical'
        }
      ]);

      const response = await request(app)
        .get('/api/stations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.stations).toHaveLength(2);
      expect(response.body.data.stations[0].name).toBe('Station 1');
      expect(response.body.data.stations[1].name).toBe('Station 2');
    });
  });

  describe('POST /api/stations', () => {
    it('should create a new station when admin', async () => {
      const stationData = {
        name: 'New Station',
        code: 'NS1',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '3 Example Street'
        },
        capacity: {
          personnel: 40,
          vehicles: 8,
          equipment: 80
        },
        type: 'fire'
      };

      const response = await request(app)
        .post('/api/stations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stationData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.station.name).toBe('New Station');

      const station = await Station.findById(response.body.data.station._id);
      expect(station).toBeTruthy();
      expect(station!.name).toBe('New Station');
    });

    it('should not create a station when not admin', async () => {
      const stationData = {
        name: 'New Station',
        code: 'NS1',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '3 Example Street'
        },
        capacity: {
          personnel: 40,
          vehicles: 8,
          equipment: 80
        },
        type: 'fire'
      };

      await request(app)
        .post('/api/stations')
        .set('Authorization', `Bearer ${token}`)
        .send(stationData)
        .expect(403);
    });
  });

  describe('GET /api/stations/:id', () => {
    it('should return a station by id', async () => {
      const station = await Station.create({
        name: 'Test Station',
        code: 'TS1',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '4 Example Street'
        },
        capacity: {
          personnel: 45,
          vehicles: 9,
          equipment: 90
        },
        type: 'mixed'
      });

      const response = await request(app)
        .get(`/api/stations/${station._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.station.name).toBe('Test Station');
    });

    it('should return 404 for non-existent station', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/stations/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/stations/:id', () => {
    it('should update a station when admin', async () => {
      const station = await Station.create({
        name: 'Old Name',
        code: 'ON1',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '5 Example Street'
        },
        capacity: {
          personnel: 35,
          vehicles: 7,
          equipment: 70
        },
        type: 'police'
      });

      const response = await request(app)
        .put(`/api/stations/${station._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.station.name).toBe('Updated Name');

      const updatedStation = await Station.findById(station._id);
      expect(updatedStation!.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/stations/:id', () => {
    it('should delete a station when admin', async () => {
      const station = await Station.create({
        name: 'To Delete',
        code: 'TD1',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
          address: '6 Example Street'
        },
        capacity: {
          personnel: 25,
          vehicles: 5,
          equipment: 50
        },
        type: 'fire'
      });

      await request(app)
        .delete(`/api/stations/${station._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedStation = await Station.findById(station._id);
      expect(deletedStation).toBeNull();
    });
  });
});
