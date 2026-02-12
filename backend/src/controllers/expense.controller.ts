import { Response, NextFunction } from 'express';
import expenseService from '../services/expense.service';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest } from '../types/express';
import { SplitType } from '../models/Expense';

export class ExpenseController {
  async createExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        groupId,
        description,
        amount,
        paidBy,
        splitType,
        splits,
        category,
        date,
      } = req.body;
      const userId = req.user!.userId;

      const expense = await expenseService.createExpense(
        groupId,
        description,
        amount,
        paidBy,
        userId,
        splitType || SplitType.EQUAL,
        splits,
        category,
        date
      );

      ApiResponse.created(res, 'Expense created successfully', { expense });
    } catch (error) {
      next(error);
    }
  }

  async getExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const expense = await expenseService.getExpenseById(id, userId);

      ApiResponse.success(res, 'Expense retrieved successfully', { expense });
    } catch (error) {
      next(error);
    }
  }

  async getGroupExpenses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupId } = req.query;
      const { category, startDate, endDate } = req.query;
      const userId = req.user!.userId;

      const filters: any = {};
      if (category) filters.category = category as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const expenses = await expenseService.getGroupExpenses(
        groupId as string,
        userId,
        filters
      );

      ApiResponse.success(res, 'Expenses retrieved successfully', { expenses });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const updates = req.body;

      const expense = await expenseService.updateExpense(id, userId, updates);

      ApiResponse.success(res, 'Expense updated successfully', { expense });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await expenseService.deleteExpense(id, userId);

      ApiResponse.success(res, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpenseController();