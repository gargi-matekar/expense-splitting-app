import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../services/group.service';
import { expenseService } from '../services/expense.service';
import { Group, Expense, GroupBalance } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<GroupBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        groupService.getById(id!),
        expenseService.getAll({ groupId: id }),
        expenseService.getGroupBalances(id!),
      ]);

      setGroup(groupRes.data?.group || null);
      setExpenses(expensesRes.data?.expenses || []);
      setBalances(balancesRes.data || null);
    } catch (error) {
      console.error('Failed to fetch group data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Group not found</div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {group.members.length} members • {expenses.length} expenses
            </p>
          </div>
          <Button onClick={() => navigate(`/groups/${id}/expenses/create`)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'expenses' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses
          </Button>
          <Button
            variant={activeTab === 'balances' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('balances')}
          >
            Balances & Settlements
          </Button>
        </div>

        {activeTab === 'expenses' ? (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No expenses yet</p>
                  <Button
                    onClick={() => navigate(`/groups/${id}/expenses/create`)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              expenses.map((expense) => (
                <Card key={expense._id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Paid by{' '}
                          {typeof expense.paidBy === 'object' ? expense.paidBy.name : 'Unknown'} •{' '}
                          {formatDate(expense.date)}
                        </p>
                        {expense.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded">
                            {expense.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{expense.splitType} split</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {balances?.balances.map((balance) => (
                    <div key={balance.userId} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {balance.userName}
                        </p>
                        <p className="text-sm text-gray-500">{balance.userEmail}</p>
                      </div>
                      <p
                        className={`font-semibold ${
                          balance.balance > 0
                            ? 'text-green-600'
                            : balance.balance < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {balance.balance > 0 ? '+' : ''}
                        {formatCurrency(balance.balance)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {balances?.settlements && balances.settlements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Settlement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {balances.settlements.map((settlement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{settlement.fromName}</span>
                            <span className="text-gray-600 dark:text-gray-400"> pays </span>
                            <span className="font-medium">{settlement.toName}</span>
                          </p>
                        </div>
                        <p className="font-semibold text-primary-600">
                          {formatCurrency(settlement.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}