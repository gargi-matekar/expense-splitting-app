import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expenseService } from '../services/expense.service';
import { groupService } from '../services/group.service';
import { useAuth } from '../context/AuthContext';
import { Group, SplitType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { handleApiError } from '../utils/helpers';

export function CreateExpensePage() {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: user?._id || '',
    category: '',
    splitType: SplitType.EQUAL,
  });

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const response = await groupService.getById(groupId!);
      setGroup(response.data?.group || null);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await expenseService.create({
        groupId: groupId!,
        description: formData.description,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        category: formData.category || undefined,
        splitType: formData.splitType,
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {group.name}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Description"
                placeholder="Dinner at restaurant"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <Input
                label="Amount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paid By
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900"
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  required
                >
                  {group.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Category (Optional)"
                placeholder="Food, Transport, etc."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Split Type
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900"
                  value={formData.splitType}
                  onChange={(e) =>
                    setFormData({ ...formData, splitType: e.target.value as SplitType })
                  }
                >
                  <option value={SplitType.EQUAL}>Equal Split</option>
                  <option value={SplitType.PERCENTAGE}>Percentage Split</option>
                  <option value={SplitType.CUSTOM}>Custom Split</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.splitType === SplitType.EQUAL && 'Amount will be split equally among all members'}
                  {formData.splitType === SplitType.PERCENTAGE && 'Specify percentage for each member'}
                  {formData.splitType === SplitType.CUSTOM && 'Specify custom amount for each member'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} fullWidth>
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}