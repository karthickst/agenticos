import { apiClient } from './client'
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/project'

export const projectsApi = {
  list: () => apiClient.get<Project[]>('/projects'),

  get: (id: string) => apiClient.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    apiClient.post<Project>('/projects', data),

  update: (id: string, data: UpdateProjectRequest) =>
    apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),
}
