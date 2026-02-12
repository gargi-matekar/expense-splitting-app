import groupService from '../../src/services/group.service';
import Group from '../../src/models/Group';
import User from '../../src/models/User';
import ApiError from '../../src/utils/apiError';

jest.mock('../../src/models/Group');
jest.mock('../../src/models/User');

describe('GroupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a group successfully', async () => {
      const mockUser = { _id: 'user123' };
      const mockGroup = {
        _id: 'group123',
        name: 'Test Group',
        createdBy: 'user123',
        members: ['user123'],
        populate: jest.fn().mockResolvedValue({
          _id: 'group123',
          name: 'Test Group',
          members: [{ _id: 'user123', name: 'Test', email: 'test@example.com' }],
        }),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Group.create as jest.Mock).mockResolvedValue(mockGroup);

      const result = await groupService.createGroup('Test Group', 'user123');

      expect(result).toBeDefined();
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Group.create).toHaveBeenCalled();
    });

    it('should throw error if creator not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        groupService.createGroup('Test Group', 'invalid-user')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('addMember', () => {
    it('should add member to group', async () => {
      const mockGroup = {
        _id: 'group123',
        members: ['user1'],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          members: ['user1', 'user2'],
        }),
      };

      const mockUser = { _id: 'user2' };

      (Group.findById as jest.Mock).mockResolvedValue(mockGroup);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await groupService.addMember('group123', 'user1', 'user2');

      expect(mockGroup.members).toContain('user2');
      expect(mockGroup.save).toHaveBeenCalled();
    });

    it('should throw error if member already exists', async () => {
      const mockGroup = {
        _id: 'group123',
        members: [{ toString: () => 'user2' }],
      };

      const mockUser = { _id: 'user2' };

      (Group.findById as jest.Mock).mockResolvedValue(mockGroup);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        groupService.addMember('group123', 'user1', 'user2')
      ).rejects.toThrow(ApiError);
    });
  });
});