import { apiClient } from './client'
import {
  Requirement,
  RequirementWithSteps,
  RequirementConnection,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  CreateConnectionRequest,
} from '../types/requirement'

export const requirementsApi = {
  // Requirement operations
  list: (projectId: string) =>
    apiClient.get<RequirementWithSteps[]>(`/projects/${projectId}/requirements`),

  get: (id: string) => apiClient.get<RequirementWithSteps>(`/requirements/${id}`),

  create: (projectId: string, data: CreateRequirementRequest) =>
    apiClient.post<Requirement>(`/projects/${projectId}/requirements`, data),

  update: (id: string, data: UpdateRequirementRequest) =>
    apiClient.put<Requirement>(`/requirements/${id}`, data),

  delete: (id: string) => apiClient.delete(`/requirements/${id}`),

  // Connection operations
  listConnections: (projectId: string) =>
    apiClient.get<RequirementConnection[]>(`/projects/${projectId}/connections`),

  createConnection: (projectId: string, data: CreateConnectionRequest) =>
    apiClient.post<RequirementConnection>(`/projects/${projectId}/connections`, data),

  deleteConnection: (id: string) => apiClient.delete(`/connections/${id}`),
}
