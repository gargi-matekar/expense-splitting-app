import settlementService from '../../src/services/settlement.service';
import Group from '../../src/models/Group';
import Expense from '../../src/models/Expense';

jest.mock('../../src/models/Group');
jest.mock('../../src/models/Expense');

describe('SettlementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateGroupBalances', () => {
    it('should calculate balances correctly', async () => {
      const mockGroup = {
        _id: 'group123',
        members: [
          { _id: 'user1', toString: () => 'user1', name: 'User 1', email: 'user1@test.com' },
          { _id: 'user2', toString: () => 'user2', name: 'User 2', email: 'user2@test.com' },
        ],
        populate: jest.fn().mockReturnThis(),
      };

      const mockExpenses = [
        {
          amount: 1000,
          paidBy: { _id: 'user1', toString: () => 'user1' },
          splits: [
            { user: { _id: 'user1', toString: () => 'user1' }, amount: 500 },
            { user: { _id: 'user2', toString: () => 'user2' }, amount: 500 },
          ],
        },
      ];

      (Group.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGroup),
      });
      (Expense.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockExpenses),
      });

      const result = await settlementService.calculateGroupBalances('group123', 'user1');

      expect(result).toHaveProperty('balances');
      expect(result).toHaveProperty('settlements');
      expect(result.balances).toHaveLength(2);
    });

    it('should generate settlements correctly', async () => {
      const mockGroup = {
        _id: 'group123',
        members: [
          { _id: 'user1', toString: () => 'user1', name: 'User 1', email: 'user1@test.com' },
          { _id: 'user2', toString: () => 'user2', name: 'User 2', email: 'user2@test.com' },
          { _id: 'user3', toString: () => 'user3', name: 'User 3', email: 'user3@test.com' },
        ],
        populate: jest.fn().mockReturnThis(),
      };

      const mockExpenses = [
        {
          amount: 3000,
          paidBy: { _id: 'user1', toString: () => 'user1' },
          splits: [
            { user: { _id: 'user1', toString: () => 'user1' }, amount: 1000 },
            { user: { _id: 'user2', toString: () => 'user2' }, amount: 1000 },
            { user: { _id: 'user3', toString: () => 'user3' }, amount: 1000 },
          ],
        },
      ];

      (Group.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGroup),
      });
      (Expense.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockExpenses),
      });

      const result = await settlementService.calculateGroupBalances('group123', 'user1');

      expect(result.settlements.length).toBeGreaterThan(0);
      expect(result.settlements[0]).toHaveProperty('from');
      expect(result.settlements[0]).toHaveProperty('to');
      expect(result.settlements[0]).toHaveProperty('amount');
    });
  });

  describe('getUserBalance', () => {
    it('should calculate user overall balance', async () => {
      const mockGroups = [
        { _id: 'group1', name: 'Group 1' },
        { _id: 'group2', name: 'Group 2' },
      ];

      (Group.find as jest.Mock).mockResolvedValue(mockGroups);

      jest.spyOn(settlementService, 'calculateGroupBalances').mockResolvedValue({
        balances: [
          {
            userId: 'user1',
            userName: 'User 1',
            userEmail: 'user1@test.com',
            balance: 500,
          },
        ],
        settlements: [],
      });

      const result = await settlementService.getUserBalance('user1');

      expect(result).toHaveProperty('totalOwed');
      expect(result).toHaveProperty('totalOwing');
      expect(result).toHaveProperty('netBalance');
      expect(result).toHaveProperty('groupBalances');
    });
  });
});