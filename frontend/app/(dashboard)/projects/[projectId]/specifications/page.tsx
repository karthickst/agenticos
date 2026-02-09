'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ModelSelector } from '@/components/specifications/ModelSelector'
import { JobStatus } from '@/components/specifications/JobStatus'
import { SpecificationViewer } from '@/components/specifications/SpecificationViewer'
import { OutdatedAlert } from '@/components/specifications/OutdatedAlert'
import { DiffViewer } from '@/components/specifications/DiffViewer'
import { specificationsApi } from '@/lib/api/specifications'
import { Specification, SpecificationJob, CLAUDE_MODELS } from '@/lib/types/specification'
import { useProjectChanges } from '@/lib/hooks/useProjectChanges'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function SpecificationsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [specifications, setSpecifications] = useState<Specification[]>([])
  const [currentJob, setCurrentJob] = useState<SpecificationJob | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSpec, setCompareSpec] = useState<Specification | null>(null)
  const { changes, checking, recheckChanges } = useProjectChanges(projectId)

  useEffect(() => {
    loadSpecifications()
  }, [projectId])

  useEffect(() => {
    // Poll for job status if there's an active job
    if (currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing')) {
      const interval = setInterval(async () => {
        try {
          const response = await specificationsApi.getJobStatus(currentJob.id)
          setCurrentJob(response.data)

          // If job completed, reload specifications and recheck changes
          if (response.data.status === 'completed') {
            setIsGenerating(false)
            await loadSpecifications()
            await recheckChanges()
            clearInterval(interval)
          } else if (response.data.status === 'failed') {
            setIsGenerating(false)
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Failed to check job status:', error)
        }
      }, 3000) // Poll every 3 seconds

      return () => clearInterval(interval)
    }
  }, [currentJob])

  const loadSpecifications = async () => {
    try {
      const response = await specificationsApi.list(projectId)
      setSpecifications(response.data)

      // Auto-select the latest specification
      if (response.data.length > 0 && !selectedSpec) {
        setSelectedSpec(response.data[0])
      }
    } catch (error) {
      console.error('Failed to load specifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (model: string) => {
    setIsGenerating(true)
    try {
      const response = await specificationsApi.generate(projectId, {
        claudeModel: model,
      })

      // Fetch the job details
      const jobResponse = await specificationsApi.getJobStatus(response.data.jobId)
      setCurrentJob(jobResponse.data)
    } catch (error: any) {
      alert(
        `Failed to start specification generation: ${
          error.response?.data?.error || error.message
        }`
      )
      setIsGenerating(false)
    }
  }

  const handleSelectSpecification = (spec: Specification) => {
    setSelectedSpec(spec)
  }

  const handleQuickRegenerate = () => {
    // Use the same model as the latest specification
    const latestModel = specifications[0]?.claudeModel || CLAUDE_MODELS[0].value
    handleGenerate(latestModel)
  }

  const handleCompare = (spec: Specification) => {
    if (!selectedSpec) return
    setCompareSpec(spec)
  }

  const handleCloseCompare = () => {
    setCompareSpec(null)
    setCompareMode(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading specifications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Software Specifications</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive software specifications using Claude AI
          </p>
        </div>
      </div>

      {/* Generation Section */}
      {(!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') && (
        <ModelSelector onGenerate={handleGenerate} isGenerating={isGenerating} />
      )}

      {/* Job Status */}
      {currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing' || currentJob.status === 'failed') && (
        <JobStatus job={currentJob} />
      )}

      {/* Outdated Alert */}
      {changes.hasChanges && !isGenerating && specifications.length > 0 && (
        <OutdatedAlert
          changedItems={changes.changedItems}
          latestChangeDate={changes.latestChangeDate}
          onRegenerate={handleQuickRegenerate}
          isGenerating={isGenerating}
        />
      )}

      {/* Version History */}
      {specifications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 flex-1"
              >
                <div className="text-left">
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    {specifications.length} specification{specifications.length !== 1 ? 's' : ''}{' '}
                    generated
                  </CardDescription>
                </div>
                {showHistory ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {specifications.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  {compareMode ? 'Cancel Compare' : 'Compare Versions'}
                </Button>
              )}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2">
                {specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedSpec?.id === spec.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSelectSpecification(spec)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">
                          Version {spec.version} - {spec.claudeModel}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(spec.createdAt).toLocaleString()}
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {selectedSpec?.id === spec.id && !compareMode && (
                          <div className="text-sm font-medium text-blue-600">Viewing</div>
                        )}
                        {compareMode && selectedSpec && selectedSpec.id !== spec.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompare(spec)}
                          >
                            Compare
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Diff Viewer */}
      {compareSpec && selectedSpec && (
        <DiffViewer
          oldSpec={compareSpec}
          newSpec={selectedSpec}
          onClose={handleCloseCompare}
        />
      )}

      {/* Specification Viewer */}
      {!compareSpec && selectedSpec && (
        <SpecificationViewer specification={selectedSpec} />
      )}

      {!selectedSpec && !currentJob && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No specifications generated yet.</p>
            <p className="text-sm mt-2">
              Generate your first specification using the form above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
