export interface TestCase {
  id: string
  requirementId: string
  name: string
  description?: string
  testData?: Record<string, any>
  expectedOutcome?: string
  status: 'pending' | 'passed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface CreateTestCaseRequest {
  name: string
  description?: string
  testData?: Record<string, any>
  expectedOutcome?: string
}

export interface UpdateTestCaseRequest {
  name?: string
  description?: string
  testData?: Record<string, any>
  expectedOutcome?: string
  status?: 'pending' | 'passed' | 'failed'
}

export const TEST_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'passed', label: 'Passed', color: 'bg-green-100 text-green-700' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
] as const
