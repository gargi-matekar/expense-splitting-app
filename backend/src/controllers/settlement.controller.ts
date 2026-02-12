import { Response, NextFunction } from 'express';
import settlementService from '../services/settlement.service';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest } from '../types/express';

export class SettlementController {
  async getGroupBalances(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupId } = req.params;
      const userId = req.user!.userId;

      const result = await settlementService.calculateGroupBalances(groupId, userId);

      ApiResponse.success(res, 'Balances calculated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getUserBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const result = await settlementService.getUserBalance(userId);

      ApiResponse.success(res, 'User balance retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SettlementController();