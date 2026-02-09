export interface DataBag {
  id: string
  projectId: string
  name: string
  description?: string
  dataSchema?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface DataBagItem {
  id: string
  dataBagId: string
  data: Record<string, any>
  createdAt: string
}

export interface DataBagWithItems {
  dataBag: DataBag
  items: DataBagItem[]
}

export interface RequirementDataBagLink {
  id: string
  requirementId: string
  dataBagId: string
  dataBagItemId?: string
  createdAt: string
}

export interface CreateDataBagRequest {
  name: string
  description?: string
  dataSchema?: Record<string, any>
}

export interface UpdateDataBagRequest {
  name?: string
  description?: string
  dataSchema?: Record<string, any>
}

export interface ImportDataRequest {
  items: Record<string, any>[]
}

export interface LinkDataBagRequest {
  dataBagId: string
  dataBagItemId?: string
}
