import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import User from '../../src/models/User';
import Group from '../../src/models/Group';
import Expense from '../../src/models/Expense';

describe('Expense API Integration Tests', () => {
  let token: string;
  let userId: string;
  let groupId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
      });

    token = userRes.body.data.token;
    userId = userRes.body.data.user._id;

    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Group' });

    groupId = groupRes.body.data.group._id;
  });

  describe('POST /api/expenses', () => {
    it('should create expense with equal split', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Dinner',
          amount: 1000,
          paidBy: userId,
          splitType: 'equal',
          category: 'Food',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.expense).toHaveProperty('description', 'Dinner');
      expect(response.body.data.expense.splits).toHaveLength(1);
    });

    it('should create expense with custom split', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Hotel',
          amount: 5000,
          paidBy: userId,
          splitType: 'custom',
          splits: [{ user: userId, amount: 5000 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.expense.amount).toBe(5000);
    });

    it('should create expense with percentage split', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Taxi',
          amount: 500,
          paidBy: userId,
          splitType: 'percentage',
          splits: [{ user: userId, percentage: 100 }],
        });

      expect(response.status).toBe(201);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          groupId,
          description: 'Dinner',
          amount: 1000,
          paidBy: userId,
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid amount', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Dinner',
          amount: -100,
          paidBy: userId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Expense 1',
          amount: 1000,
          paidBy: userId,
          category: 'Food',
        });

      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Expense 2',
          amount: 2000,
          paidBy: userId,
          category: 'Transport',
        });
    });

    it('should get all expenses for a group', async () => {
      const response = await request(app)
        .get(`/api/expenses?groupId=${groupId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.expenses).toHaveLength(2);
    });

    it('should filter expenses by category', async () => {
      const response = await request(app)
        .get(`/api/expenses?groupId=${groupId}&category=Food`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.expenses).toHaveLength(1);
      expect(response.body.data.expenses[0].category).toBe('Food');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    let expenseId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Test Expense',
          amount: 1000,
          paidBy: userId,
        });

      expenseId = response.body.data.expense._id;
    });

    it('should delete expense as payer', async () => {
      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/expenses/${expenseId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/expenses/settlements/group/:groupId', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groupId,
          description: 'Test Expense',
          amount: 1000,
          paidBy: userId,
        });
    });

    it('should calculate group balances', async () => {
      const response = await request(app)
        .get(`/api/expenses/settlements/group/${groupId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('balances');
      expect(response.body.data).toHaveProperty('settlements');
    });
  });
});