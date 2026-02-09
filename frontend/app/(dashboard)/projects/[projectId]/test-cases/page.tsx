'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TestCaseForm } from '@/components/test-cases/TestCaseForm'
import { testCasesApi } from '@/lib/api/test-cases'
import { requirementsApi } from '@/lib/api/requirements'
import { TestCase, TEST_STATUSES } from '@/lib/types/test-case'
import { RequirementWithSteps } from '@/lib/types/requirement'

export default function TestCasesPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [requirements, setRequirements] = useState<RequirementWithSteps[]>([])
  const [testCasesByRequirement, setTestCasesByRequirement] = useState<Record<string, TestCase[]>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null)
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null)

  useEffect(() => {
    loadRequirements()
  }, [projectId])

  const loadRequirements = async () => {
    try {
      const response = await requirementsApi.list(projectId)
      setRequirements(response.data)

      // Load test cases for each requirement
      const testCasesMap: Record<string, TestCase[]> = {}
      for (const req of response.data) {
        const testCasesRes = await testCasesApi.list(req.requirement.id)
        testCasesMap[req.requirement.id] = testCasesRes.data
      }
      setTestCasesByRequirement(testCasesMap)
    } catch (error) {
      console.error('Failed to load requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestCase = (requirementId: string) => {
    setSelectedRequirementId(requirementId)
    setEditingTestCase(null)
    setShowForm(true)
  }

  const handleEditTestCase = (testCase: TestCase) => {
    setSelectedRequirementId(testCase.requirementId)
    setEditingTestCase(testCase)
    setShowForm(true)
  }

  const handleSaveTestCase = async (
    name: string,
    description: string,
    testData: Record<string, any> | undefined,
    expectedOutcome: string,
    status?: string
  ) => {
    if (!selectedRequirementId) return

    try {
      if (editingTestCase) {
        await testCasesApi.update(editingTestCase.id, {
          name,
          description: description || undefined,
          testData,
          expectedOutcome: expectedOutcome || undefined,
          status: status as any,
        })
      } else {
        await testCasesApi.create(selectedRequirementId, {
          name,
          description: description || undefined,
          testData,
          expectedOutcome: expectedOutcome || undefined,
        })
      }
      setShowForm(false)
      setEditingTestCase(null)
      setSelectedRequirementId(null)
      loadRequirements()
    } catch (error: any) {
      alert(`Failed to save test case: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) return

    try {
      await testCasesApi.delete(testCaseId)
      loadRequirements()
    } catch (error) {
      console.error('Failed to delete test case:', error)
    }
  }

  const handleUpdateStatus = async (testCaseId: string, newStatus: string) => {
    try {
      await testCasesApi.update(testCaseId, { status: newStatus as any })
      loadRequirements()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    return TEST_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (showForm && selectedRequirementId) {
    return (
      <div className="flex items-center justify-center p-8">
        <TestCaseForm
          projectId={projectId}
          initialData={editingTestCase || undefined}
          onSave={handleSaveTestCase}
          onCancel={() => {
            setShowForm(false)
            setEditingTestCase(null)
            setSelectedRequirementId(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Cases</h1>
          <p className="text-gray-600 mt-1">
            Manage test cases for your requirements
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requirements.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Requirements Yet</CardTitle>
              <CardDescription>
                Create requirements first to add test cases
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          requirements.map((req) => {
            const testCases = testCasesByRequirement[req.requirement.id] || []
            const isExpanded = expandedRequirement === req.requirement.id

            return (
              <Card key={req.requirement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>{req.requirement.title}</CardTitle>
                      <CardDescription>
                        {testCases.length} test case{testCases.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateTestCase(req.requirement.id)}
                      >
                        Add Test Case
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedRequirement(isExpanded ? null : req.requirement.id)
                        }
                      >
                        {isExpanded ? 'Hide' : 'Show'} Test Cases
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    {testCases.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No test cases yet. Click "Add Test Case" to create one.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {testCases.map((testCase) => (
                          <div
                            key={testCase.id}
                            className="border rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold">{testCase.name}</h3>
                                {testCase.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {testCase.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTestCase(testCase)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteTestCase(testCase.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Status:</span>
                              <select
                                value={testCase.status}
                                onChange={(e) =>
                                  handleUpdateStatus(testCase.id, e.target.value)
                                }
                                className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                  testCase.status
                                )}`}
                              >
                                {TEST_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {testCase.testData && (
                              <div className="border-t pt-2 mt-2">
                                <span className="text-sm font-medium">Test Data:</span>
                                <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(testCase.testData, null, 2)}
                                </pre>
                              </div>
                            )}

                            {testCase.expectedOutcome && (
                              <div className="border-t pt-2">
                                <span className="text-sm font-medium">Expected Outcome:</span>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                  {testCase.expectedOutcome}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
