import Expense from '../models/Expense';
import Group from '../models/Group';
import ApiError from '../utils/apiError';

interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export class SettlementService {
  async calculateGroupBalances(
    groupId: string,
    userId: string
  ): Promise<{ balances: Balance[]; settlements: Settlement[] }> {
    // Verify group exists and user is a member
    const group = await Group.findById(groupId).populate('members', 'name email');
    
    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    const isMember = group.members.some(
      (member: any) => member._id.toString() === userId
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    // Get all expenses for the group
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    // Calculate balances for each member
    const balanceMap = new Map<string, { balance: number; name: string; email: string }>();

    // Initialize all members with 0 balance
    group.members.forEach((member: any) => {
      balanceMap.set(member._id.toString(), {
        balance: 0,
        name: member.name,
        email: member.email,
      });
    });

    // Calculate balances from expenses
    expenses.forEach((expense) => {
      const payerId = expense.paidBy._id.toString();
      
      // Add amount paid to payer's balance
      const payerBalance = balanceMap.get(payerId);
      if (payerBalance) {
        payerBalance.balance += expense.amount;
      }

      // Subtract owed amounts from each split
      expense.splits.forEach((split: any) => {
        const splitUserId = split.user._id.toString();
        const splitBalance = balanceMap.get(splitUserId);
        if (splitBalance) {
          splitBalance.balance -= split.amount;
        }
      });
    });

    // Convert balances to array
    const balances: Balance[] = Array.from(balanceMap.entries()).map(
      ([userId, data]) => ({
        userId,
        userName: data.name,
        userEmail: data.email,
        balance: Math.round(data.balance * 100) / 100,
      })
    );

    // Calculate settlements using greedy algorithm
    const settlements = this.calculateSettlements(balances);

    return { balances, settlements };
  }

  private calculateSettlements(balances: Balance[]): Settlement[] {
    const settlements: Settlement[] = [];
    
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
      .filter((b) => b.balance > 0.01)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balance - a.balance);
    
    const debtors = balances
      .filter((b) => b.balance < -0.01)
      .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.balance, debtor.balance);

      if (settleAmount > 0.01) {
        settlements.push({
          from: debtor.userId,
          fromName: debtor.userName,
          to: creditor.userId,
          toName: creditor.userName,
          amount: Math.round(settleAmount * 100) / 100,
        });
      }

      creditor.balance -= settleAmount;
      debtor.balance -= settleAmount;

      if (creditor.balance < 0.01) {
        i++;
      }
      if (debtor.balance < 0.01) {
        j++;
      }
    }

    return settlements;
  }

  async getUserBalance(userId: string): Promise<{
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
    groupBalances: Array<{
      groupId: string;
      groupName: string;
      balance: number;
    }>;
  }> {
    // Find all groups the user is a member of
    const groups = await Group.find({ members: userId });

    let totalOwed = 0;
    let totalOwing = 0;
    const groupBalances = [];

    for (const group of groups) {
      const { balances } = await this.calculateGroupBalances(
        group._id.toString(),
        userId
      );

      const userBalance = balances.find((b) => b.userId === userId);
      
      if (userBalance) {
        const balance = userBalance.balance;
        
        groupBalances.push({
          groupId: group._id.toString(),
          groupName: group.name,
          balance: Math.round(balance * 100) / 100,
        });

        if (balance > 0) {
          totalOwed += balance;
        } else if (balance < 0) {
          totalOwing += Math.abs(balance);
        }
      }
    }

    return {
      totalOwed: Math.round(totalOwed * 100) / 100,
      totalOwing: Math.round(totalOwing * 100) / 100,
      netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
      groupBalances,
    };
  }
}

export default new SettlementService();