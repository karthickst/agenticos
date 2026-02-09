export interface Domain {
  id: string
  projectId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface DomainAttribute {
  id: string
  domainId: string
  name: string
  dataType: string
  isRequired: boolean
  defaultValue?: string
  validationRules?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface DomainWithAttributes {
  domain: Domain
  attributes: DomainAttribute[]
}

export interface CreateDomainRequest {
  name: string
  description?: string
}

export interface UpdateDomainRequest {
  name?: string
  description?: string
}

export interface CreateAttributeRequest {
  name: string
  dataType: string
  isRequired?: boolean
  defaultValue?: string
  validationRules?: Record<string, any>
}

export interface UpdateAttributeRequest {
  name?: string
  dataType?: string
  isRequired?: boolean
  defaultValue?: string
  validationRules?: Record<string, any>
}

export const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
] as const
