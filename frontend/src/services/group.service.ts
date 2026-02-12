import apiClient from './api';
import { ApiResponse, Group, CreateGroupData } from '../types';

export const groupService = {
  getAll: async (): Promise<ApiResponse<{ groups: Group[] }>> => {
    const response = await apiClient.get<ApiResponse<{ groups: Group[] }>>('/groups');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ group: Group }>> => {
    const response = await apiClient.get<ApiResponse<{ group: Group }>>(`/groups/${id}`);
    return response.data;
  },

  create: async (data: CreateGroupData): Promise<ApiResponse<{ group: Group }>> => {
    const response = await apiClient.post<ApiResponse<{ group: Group }>>('/groups', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateGroupData>
  ): Promise<ApiResponse<{ group: Group }>> => {
    const response = await apiClient.put<ApiResponse<{ group: Group }>>(`/groups/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/groups/${id}`);
    return response.data;
  },

  addMember: async (groupId: string, userId: string): Promise<ApiResponse<{ group: Group }>> => {
    const response = await apiClient.post<ApiResponse<{ group: Group }>>(
      `/groups/${groupId}/members`,
      { userId }
    );
    return response.data;
  },

  removeMember: async (groupId: string, userId: string): Promise<ApiResponse<{ group: Group }>> => {
    const response = await apiClient.delete<ApiResponse<{ group: Group }>>(
      `/groups/${groupId}/members/${userId}`
    );
    return response.data;
  },
};