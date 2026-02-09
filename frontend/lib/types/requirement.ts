export interface Requirement {
  id: string
  projectId: string
  title: string
  description?: string
  gherkinScenario: string
  positionX?: number
  positionY?: number
  createdAt: string
  updatedAt: string
}

export interface RequirementStep {
  id: string
  requirementId: string
  stepType: 'given' | 'when' | 'then' | 'and' | 'but'
  stepOrder: number
  stepText: string
  domainReferences?: DomainReference[]
  createdAt: string
}

export interface DomainReference {
  domainId: string
  attributeId: string
  referenceText: string
}

export interface RequirementWithSteps {
  requirement: Requirement
  steps: RequirementStep[]
}

export interface RequirementConnection {
  id: string
  projectId: string
  sourceRequirementId: string
  targetRequirementId: string
  connectionType?: string
  createdAt: string
}

export interface CreateRequirementRequest {
  title: string
  description?: string
  gherkinScenario: string
  positionX?: number
  positionY?: number
}

export interface UpdateRequirementRequest {
  title?: string
  description?: string
  gherkinScenario?: string
  positionX?: number
  positionY?: number
}

export interface CreateConnectionRequest {
  sourceRequirementId: string
  targetRequirementId: string
  connectionType?: string
}

export const STEP_TYPES = [
  { value: 'given', label: 'Given', color: 'bg-blue-100 text-blue-700' },
  { value: 'when', label: 'When', color: 'bg-green-100 text-green-700' },
  { value: 'then', label: 'Then', color: 'bg-purple-100 text-purple-700' },
  { value: 'and', label: 'And', color: 'bg-gray-100 text-gray-700' },
  { value: 'but', label: 'But', color: 'bg-orange-100 text-orange-700' },
] as const
