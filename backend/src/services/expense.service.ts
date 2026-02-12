import mongoose from 'mongoose';
import Expense, { IExpenseDocument, ISplit, SplitType } from '../models/Expense';
import Group from '../models/Group';
import ApiError from '../utils/apiError';

export class ExpenseService {
  async createExpense(
    groupId: string,
    description: string,
    amount: number,
    paidBy: string,
    userId: string,
    splitType: SplitType = SplitType.EQUAL,
    splits?: ISplit[],
    category?: string,
    date?: Date
  ): Promise<IExpenseDocument> {
    // Validate group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    // Validate paidBy user is a member
    const isPaidByMember = group.members.some(
      (member) => member.toString() === paidBy
    );
    if (!isPaidByMember) {
      throw ApiError.badRequest('Paid by user is not a member of this group');
    }

    // Calculate splits based on split type
    let calculatedSplits: ISplit[];

    if (splitType === SplitType.EQUAL) {
      // Split equally among all members
      const splitAmount = Math.round((amount / group.members.length) * 100) / 100;
      let totalAssigned = splitAmount * group.members.length;
      const difference = Math.round((amount - totalAssigned) * 100) / 100;

      calculatedSplits = group.members.map((member, index) => ({
        user: member,
        amount: index === 0 ? splitAmount + difference : splitAmount,
      }));
    } else if (splitType === SplitType.CUSTOM && splits) {
      // Validate custom splits
      if (splits.length === 0) {
        throw ApiError.badRequest('Custom splits cannot be empty');
      }

      // Ensure all split users are members
      const splitUserIds = splits.map((s) => s.user.toString());
      const allMembersValid = splitUserIds.every((userId) =>
        group.members.some((member) => member.toString() === userId)
      );

      if (!allMembersValid) {
        throw ApiError.badRequest('All split users must be group members');
      }

      calculatedSplits = splits.map((s) => ({
        user: new mongoose.Types.ObjectId(s.user.toString()),
        amount: s.amount,
        percentage: s.percentage,
      }));
    } else if (splitType === SplitType.PERCENTAGE && splits) {
      // Validate percentage splits
      if (splits.length === 0) {
        throw ApiError.badRequest('Percentage splits cannot be empty');
      }

      const totalPercentage = splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw ApiError.badRequest('Percentages must add up to 100');
      }

      calculatedSplits = splits.map((s) => ({
        user: new mongoose.Types.ObjectId(s.user.toString()),
        amount: Math.round((amount * (s.percentage || 0)) / 100 * 100) / 100,
        percentage: s.percentage,
      }));
    } else {
      throw ApiError.badRequest('Invalid split type or missing split data');
    }

    // Create expense
    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      paidBy,
      splitType,
      splits: calculatedSplits,
      category,
      date: date || new Date(),
    });

    return await expense
      .populate('paidBy', 'name email')
      .then((exp) => exp.populate('splits.user', 'name email'));
  }

  async getExpenseById(
    expenseId: string,
    userId: string
  ): Promise<IExpenseDocument> {
    const expense = await Expense.findById(expenseId)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .populate('group');

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Verify user is a member of the group
    const group = await Group.findById(expense.group);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return expense;
  }

  async getGroupExpenses(
    groupId: string,
    userId: string,
    filters?: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<IExpenseDocument[]> {
    // Verify user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some(
      (member) => member.toString() === userId
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    // Build query
    const query: any = { group: groupId };

    if (filters) {
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.date.$lte = filters.endDate;
        }
      }
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ date: -1 });

    return expenses;
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    updates: {
      description?: string;
      amount?: number;
      category?: string;
      date?: Date;
    }
  ): Promise<IExpenseDocument> {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Only the person who paid can update the expense
    if (expense.paidBy.toString() !== userId) {
      throw ApiError.forbidden('Only the person who paid can update this expense');
    }

    // Update allowed fields
    if (updates.description) {
      expense.description = updates.description;
    }

    if (updates.category !== undefined) {
      expense.category = updates.category;
    }

    if (updates.date) {
      expense.date = updates.date;
    }

    // If amount changes, recalculate splits
    if (updates.amount && updates.amount !== expense.amount) {
      expense.amount = updates.amount;

      if (expense.splitType === SplitType.EQUAL) {
        const group = await Group.findById(expense.group);
        if (group) {
          const splitAmount = Math.round((updates.amount / group.members.length) * 100) / 100;
          let totalAssigned = splitAmount * group.members.length;
          const difference = Math.round((updates.amount - totalAssigned) * 100) / 100;

          expense.splits = group.members.map((member, index) => ({
            user: member,
            amount: index === 0 ? splitAmount + difference : splitAmount,
          }));
        }
      } else if (expense.splitType === SplitType.PERCENTAGE) {
        expense.splits = expense.splits.map((split) => ({
          user: split.user,
          amount: Math.round((updates.amount! * (split.percentage || 0)) / 100 * 100) / 100,
          percentage: split.percentage,
        }));
      }
    }

    await expense.save();

    return await expense
      .populate('paidBy', 'name email')
      .then((exp) => exp.populate('splits.user', 'name email'));
  }

  async deleteExpense(expenseId: string, userId: string): Promise<void> {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      throw ApiError.notFound('Expense not found');
    }

    // Only the person who paid or group creator can delete
    const group = await Group.findById(expense.group);
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isPayer = expense.paidBy.toString() === userId;
    const isCreator = group.createdBy.toString() === userId;

    if (!isPayer && !isCreator) {
      throw ApiError.forbidden(
        'Only the person who paid or group creator can delete this expense'
      );
    }

    await Expense.findByIdAndDelete(expenseId);
  }
}

export default new ExpenseService();