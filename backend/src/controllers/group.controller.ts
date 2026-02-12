import { Response, NextFunction } from 'express';
import groupService from '../services/group.service';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest } from '../types/express';

export class GroupController {
  async createGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, members } = req.body;
      const userId = req.user!.userId;

      const group = await groupService.createGroup(name, userId, description, members);

      ApiResponse.created(res, 'Group created successfully', { group });
    } catch (error) {
      next(error);
    }
  }

  async getGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const group = await groupService.getGroupById(id, userId);

      ApiResponse.success(res, 'Group retrieved successfully', { group });
    } catch (error) {
      next(error);
    }
  }

  async getUserGroups(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const groups = await groupService.getUserGroups(userId);

      ApiResponse.success(res, 'Groups retrieved successfully', { groups });
    } catch (error) {
      next(error);
    }
  }

  async updateGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const updates = req.body;

      const group = await groupService.updateGroup(id, userId, updates);

      ApiResponse.success(res, 'Group updated successfully', { group });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId: newMemberId } = req.body;
      const userId = req.user!.userId;

      const group = await groupService.addMember(id, userId, newMemberId);

      ApiResponse.success(res, 'Member added successfully', { group });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId: memberToRemoveId } = req.params;
      const userId = req.user!.userId;

      const group = await groupService.removeMember(id, userId, memberToRemoveId);

      ApiResponse.success(res, 'Member removed successfully', { group });
    } catch (error) {
      next(error);
    }
  }

  async deleteGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await groupService.deleteGroup(id, userId);

      ApiResponse.success(res, 'Group deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new GroupController();