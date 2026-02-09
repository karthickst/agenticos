export interface Specification {
  id: string
  projectId: string
  claudeModel: string
  specificationText: string
  metadata?: Record<string, any>
  version: number
  createdAt: string
}

export interface SpecificationJob {
  id: string
  projectId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  claudeModel: string
  errorMessage?: string
  createdAt: string
  completedAt?: string
}

export interface GenerateSpecificationRequest {
  claudeModel: string
}

export interface GenerateSpecificationResponse {
  jobId: string
  status: string
}

export const CLAUDE_MODELS = [
  {
    value: 'claude-opus-4-5-20251101',
    label: 'Claude Opus 4.5',
    description: 'Most powerful model for complex tasks',
  },
  {
    value: 'claude-sonnet-4-5-20250514',
    label: 'Claude Sonnet 4.5',
    description: 'Balanced performance and speed',
  },
  {
    value: 'claude-haiku-4-20250514',
    label: 'Claude Haiku 4',
    description: 'Fastest model for quick tasks',
  },
] as const

export const JOB_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
] as const
