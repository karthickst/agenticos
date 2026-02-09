'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { dataBagsApi } from '@/lib/api/data-bags'
import { DataBagWithItems } from '@/lib/types/data-bag'
import { TestCase, TEST_STATUSES } from '@/lib/types/test-case'

interface TestCaseFormProps {
  projectId: string
  initialData?: TestCase
  onSave: (
    name: string,
    description: string,
    testData: Record<string, any> | undefined,
    expectedOutcome: string,
    status?: string
  ) => void
  onCancel: () => void
}

export function TestCaseForm({
  projectId,
  initialData,
  onSave,
  onCancel,
}: TestCaseFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [expectedOutcome, setExpectedOutcome] = useState(initialData?.expectedOutcome || '')
  const [status, setStatus] = useState<string>(initialData?.status || 'pending')
  const [dataBags, setDataBags] = useState<DataBagWithItems[]>([])
  const [selectedBagId, setSelectedBagId] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [testData, setTestData] = useState<Record<string, any> | undefined>(initialData?.testData)

  useEffect(() => {
    loadDataBags()
  }, [projectId])

  const loadDataBags = async () => {
    try {
      const response = await dataBagsApi.list(projectId)
      setDataBags(response.data)
    } catch (error) {
      console.error('Failed to load data bags:', error)
    }
  }

  const handleSelectDataBagItem = () => {
    if (!selectedBagId || !selectedItemId) return

    const bag = dataBags.find((b) => b.dataBag.id === selectedBagId)
    const item = bag?.items.find((i) => i.id === selectedItemId)

    if (item) {
      setTestData(item.data)
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please provide a test case name')
      return
    }
    onSave(name, description, testData, expectedOutcome, initialData ? status : undefined)
  }

  const selectedBag = dataBags.find((b) => b.dataBag.id === selectedBagId)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Test Case' : 'Create Test Case'}</CardTitle>
        <CardDescription>
          Define a test case for this requirement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Test Case Name</Label>
          <Input
            id="name"
            placeholder="Valid user login"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Test successful login with valid credentials"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {initialData && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {TEST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold">Test Data (Optional)</h3>

          <div className="space-y-2">
            <Label htmlFor="dataBag">Select from Data Bag</Label>
            <div className="flex gap-2">
              <Select
                id="dataBag"
                value={selectedBagId}
                onChange={(e) => {
                  setSelectedBagId(e.target.value)
                  setSelectedItemId('')
                }}
                className="flex-1"
              >
                <option value="">-- Select Data Bag --</option>
                {dataBags.map((bag) => (
                  <option key={bag.dataBag.id} value={bag.dataBag.id}>
                    {bag.dataBag.name} ({bag.items.length} items)
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {selectedBag && selectedBag.items.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="item">Select Test Data Item</Label>
              <div className="flex gap-2">
                <Select
                  id="item"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="flex-1"
                >
                  <option value="">-- Select Item --</option>
                  {selectedBag.items.map((item, idx) => {
                    const preview = Object.entries(item.data)
                      .slice(0, 2)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                    return (
                      <option key={item.id} value={item.id}>
                        Item #{idx + 1} ({preview}...)
                      </option>
                    )
                  })}
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectDataBagItem}
                  disabled={!selectedItemId}
                >
                  Use
                </Button>
              </div>
            </div>
          )}

          {testData && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Test Data:</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestData(undefined)}
                >
                  Clear
                </Button>
              </div>
              <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedOutcome">Expected Outcome (Optional)</Label>
          <textarea
            id="expectedOutcome"
            className="w-full h-24 p-3 border rounded-md text-sm"
            placeholder="User should be redirected to the dashboard&#10;Session token should be created"
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialData ? 'Update' : 'Create'} Test Case
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
