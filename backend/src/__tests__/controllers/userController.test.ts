import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import User, { UserRole } from '../../models/User';

describe('User Controller', () => {
  let token: string;
  let adminToken: string;

  beforeEach(async () => {
    const { token: userToken } = await global.createTestUser('user');
    const { token: adminUserToken } = await global.createTestUser('admin');
    token = userToken;
    adminToken = adminUserToken;
  });

  describe('GET /api/users', () => {
    it('should return all users when admin', async () => {
      // Create test users
      await User.create([
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          role: UserRole.FIREFIGHTER,
          badgeNumber: 'FF001',
          station: new mongoose.Types.ObjectId(),
          department: 'Paris',
          region: new mongoose.Types.ObjectId(),
          contactInfo: {
            phone: '123456789',
            emergencyContact: {
              name: 'Jane Doe',
              relationship: 'Spouse',
              phone: '987654321'
            }
          }
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password123',
          role: UserRole.TEAM_LEADER,
          badgeNumber: 'TL001',
          station: new mongoose.Types.ObjectId(),
          department: 'Lyon',
          region: new mongoose.Types.ObjectId(),
          contactInfo: {
            phone: '123456789',
            emergencyContact: {
              name: 'John Smith',
              relationship: 'Spouse',
              phone: '987654321'
            }
          }
        }
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.users.some((user: any) => user.email === 'john@example.com')).toBeTruthy();
      expect(response.body.data.users.some((user: any) => user.email === 'jane@example.com')).toBeTruthy();
    });

    it('should not allow regular users to get all users', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        password: 'password123',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF002',
        station: new mongoose.Types.ObjectId(),
        department: 'Marseille',
        region: new mongoose.Types.ObjectId(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Parent',
            phone: '987654321'
          }
        }
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test.user@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user when admin', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        password: 'Password123!',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF003',
        station: new mongoose.Types.ObjectId().toString(),
        department: 'Nice',
        region: new mongoose.Types.ObjectId().toString(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Sibling',
            phone: '987654321'
          }
        }
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('new.user@example.com');

      const user = await User.findById(response.body.data.user._id);
      expect(user).toBeTruthy();
      expect(user!.email).toBe('new.user@example.com');
    });

    it('should not create a user when not admin', async () => {
      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        password: 'Password123!',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF003',
        station: new mongoose.Types.ObjectId().toString(),
        department: 'Nice',
        region: new mongoose.Types.ObjectId().toString(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Sibling',
            phone: '987654321'
          }
        }
      };

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userData)
        .expect(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user when admin', async () => {
      const user = await User.create({
        firstName: 'Update',
        lastName: 'Test',
        email: 'update.test@example.com',
        password: 'password123',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF004',
        station: new mongoose.Types.ObjectId(),
        department: 'Toulouse',
        region: new mongoose.Types.ObjectId(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Parent',
            phone: '987654321'
          }
        }
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated', lastName: 'Name' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser!.firstName).toBe('Updated');
      expect(updatedUser!.lastName).toBe('Name');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user when admin', async () => {
      const user = await User.create({
        firstName: 'Delete',
        lastName: 'Test',
        email: 'delete.test@example.com',
        password: 'password123',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF005',
        station: new mongoose.Types.ObjectId(),
        department: 'Bordeaux',
        region: new mongoose.Types.ObjectId(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Parent',
            phone: '987654321'
          }
        }
      });

      await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should not delete a user when not admin', async () => {
      const user = await User.create({
        firstName: 'Delete',
        lastName: 'Test',
        email: 'nodelete.test@example.com',
        password: 'password123',
        role: UserRole.FIREFIGHTER,
        badgeNumber: 'FF006',
        station: new mongoose.Types.ObjectId(),
        department: 'Lille',
        region: new mongoose.Types.ObjectId(),
        contactInfo: {
          phone: '123456789',
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Parent',
            phone: '987654321'
          }
        }
      });

      await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      const notDeletedUser = await User.findById(user._id);
      expect(notDeletedUser).toBeTruthy();
    });
  });
});
