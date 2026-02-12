import apiClient from './api';
import { ApiResponse, Expense, CreateExpenseData, GroupBalance } from '../types';

export const expenseService = {
  getAll: async (filters?: {
    groupId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ expenses: Expense[] }>> => {
    const params = new URLSearchParams();
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<ApiResponse<{ expenses: Expense[] }>>(
      `/expenses?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await apiClient.get<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseData): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await apiClient.post<ApiResponse<{ expense: Expense }>>('/expenses', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateExpenseData>
  ): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await apiClient.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/expenses/${id}`);
    return response.data;
  },

  getGroupBalances: async (groupId: string): Promise<ApiResponse<GroupBalance>> => {
    const response = await apiClient.get<ApiResponse<GroupBalance>>(
      `/expenses/settlements/group/${groupId}`
    );
    return response.data;
  },

  getUserBalance: async (): Promise<
    ApiResponse<{
      totalOwed: number;
      totalOwing: number;
      netBalance: number;
      groupBalances: Array<{
        groupId: string;
        groupName: string;
        balance: number;
      }>;
    }>
  > => {
    const response = await apiClient.get('/expenses/settlements/user');
    return response.data;
  },
};