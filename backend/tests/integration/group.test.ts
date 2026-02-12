import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import Group from '../../src/models/Group';

describe('Group API Integration Tests', () => {
  let token1: string;
  let token2: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    // Create two users
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Test123!',
      });
    token1 = res1.body.data.token;
    userId1 = res1.body.data.user._id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Test123!',
      });
    token2 = res2.body.data.token;
    userId2 = res2.body.data.user._id;
  });

  describe('POST /api/groups', () => {
    it('should create a group successfully', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'Trip to Goa',
          description: 'Beach vacation',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.group).toHaveProperty('name', 'Trip to Goa');
      expect(response.body.data.group.members).toHaveLength(1);
    });

    it('should create group with members', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'Trip to Goa',
          members: [userId2],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.group.members).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/groups')
        .send({
          name: 'Trip to Goa',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid name', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'A',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/groups', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Group 1' });

      await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Group 2' });
    });

    it('should get all user groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.groups).toHaveLength(2);
    });
  });

  describe('POST /api/groups/:id/members', () => {
    let groupId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Test Group' });

      groupId = response.body.data.group._id;
    });

    it('should add member to group', async () => {
      const response = await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: userId2 });

      expect(response.status).toBe(200);
      expect(response.body.data.group.members).toHaveLength(2);
    });

    it('should fail to add duplicate member', async () => {
      await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: userId2 });

      const response = await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: userId2 });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    let groupId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Test Group' });

      groupId = response.body.data.group._id;
    });

    it('should delete group as creator', async () => {
      const response = await request(app)
        .delete(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(response.status).toBe(200);
    });

    it('should fail to delete as non-creator', async () => {
      await request(app)
        .post(`/api/groups/${groupId}/members`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ userId: userId2 });

      const response = await request(app)
        .delete(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(response.status).toBe(403);
    });
  });
});