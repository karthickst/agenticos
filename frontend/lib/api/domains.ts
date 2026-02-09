import { apiClient } from './client'
import {
  Domain,
  DomainAttribute,
  DomainWithAttributes,
  CreateDomainRequest,
  UpdateDomainRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '../types/domain'

export const domainsApi = {
  // Domain operations
  list: (projectId: string) =>
    apiClient.get<DomainWithAttributes[]>(`/projects/${projectId}/domains`),

  get: (id: string) => apiClient.get<DomainWithAttributes>(`/domains/${id}`),

  create: (projectId: string, data: CreateDomainRequest) =>
    apiClient.post<Domain>(`/projects/${projectId}/domains`, data),

  update: (id: string, data: UpdateDomainRequest) =>
    apiClient.put<Domain>(`/domains/${id}`, data),

  delete: (id: string) => apiClient.delete(`/domains/${id}`),

  // Attribute operations
  listAttributes: (domainId: string) =>
    apiClient.get<DomainAttribute[]>(`/domains/${domainId}/attributes`),

  getAttribute: (id: string) =>
    apiClient.get<DomainAttribute>(`/attributes/${id}`),

  createAttribute: (domainId: string, data: CreateAttributeRequest) =>
    apiClient.post<DomainAttribute>(`/domains/${domainId}/attributes`, data),

  updateAttribute: (id: string, data: UpdateAttributeRequest) =>
    apiClient.put<DomainAttribute>(`/attributes/${id}`, data),

  deleteAttribute: (id: string) => apiClient.delete(`/attributes/${id}`),
}
