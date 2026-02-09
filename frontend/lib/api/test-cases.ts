import { apiClient } from './client'
import { TestCase, CreateTestCaseRequest, UpdateTestCaseRequest } from '../types/test-case'

export const testCasesApi = {
  // Test Case operations
  list: (requirementId: string) =>
    apiClient.get<TestCase[]>(`/requirements/${requirementId}/test-cases`),

  get: (id: string) => apiClient.get<TestCase>(`/test-cases/${id}`),

  create: (requirementId: string, data: CreateTestCaseRequest) =>
    apiClient.post<TestCase>(`/requirements/${requirementId}/test-cases`, data),

  update: (id: string, data: UpdateTestCaseRequest) =>
    apiClient.put<TestCase>(`/test-cases/${id}`, data),

  delete: (id: string) => apiClient.delete(`/test-cases/${id}`),
}
