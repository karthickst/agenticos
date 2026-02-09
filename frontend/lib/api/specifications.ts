import { apiClient } from './client'
import {
  Specification,
  SpecificationJob,
  GenerateSpecificationRequest,
  GenerateSpecificationResponse,
} from '../types/specification'

export const specificationsApi = {
  // Specification operations
  list: (projectId: string) =>
    apiClient.get<Specification[]>(`/projects/${projectId}/specifications`),

  get: (id: string) => apiClient.get<Specification>(`/specifications/${id}`),

  generate: (projectId: string, data: GenerateSpecificationRequest) =>
    apiClient.post<GenerateSpecificationResponse>(
      `/projects/${projectId}/specifications/generate`,
      data
    ),

  // Job operations
  getJobStatus: (jobId: string) =>
    apiClient.get<SpecificationJob>(`/specification-jobs/${jobId}`),
}
