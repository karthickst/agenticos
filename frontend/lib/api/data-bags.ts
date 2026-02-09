import { apiClient } from './client'
import {
  DataBag,
  DataBagItem,
  DataBagWithItems,
  RequirementDataBagLink,
  CreateDataBagRequest,
  UpdateDataBagRequest,
  ImportDataRequest,
  LinkDataBagRequest,
} from '../types/data-bag'

export const dataBagsApi = {
  // Data Bag operations
  list: (projectId: string) =>
    apiClient.get<DataBagWithItems[]>(`/projects/${projectId}/data-bags`),

  get: (id: string) => apiClient.get<DataBagWithItems>(`/data-bags/${id}`),

  create: (projectId: string, data: CreateDataBagRequest) =>
    apiClient.post<DataBag>(`/projects/${projectId}/data-bags`, data),

  update: (id: string, data: UpdateDataBagRequest) =>
    apiClient.put<DataBag>(`/data-bags/${id}`, data),

  delete: (id: string) => apiClient.delete(`/data-bags/${id}`),

  // Data Bag Item operations
  importData: (dataBagId: string, data: ImportDataRequest) =>
    apiClient.post<DataBagItem[]>(`/data-bags/${dataBagId}/items`, data),

  listItems: (dataBagId: string) =>
    apiClient.get<DataBagItem[]>(`/data-bags/${dataBagId}/items`),

  deleteItem: (id: string) => apiClient.delete(`/data-bag-items/${id}`),

  // Link operations
  linkToRequirement: (requirementId: string, data: LinkDataBagRequest) =>
    apiClient.post<RequirementDataBagLink>(`/requirements/${requirementId}/data-bags`, data),

  listRequirementLinks: (requirementId: string) =>
    apiClient.get<RequirementDataBagLink[]>(`/requirements/${requirementId}/data-bags`),

  deleteLink: (id: string) => apiClient.delete(`/requirement-data-bag-links/${id}`),
}
