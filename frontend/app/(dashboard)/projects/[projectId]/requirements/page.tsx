'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Node } from 'reactflow'
import { Button } from '@/components/ui/button'
import { RequirementsCanvas } from '@/components/requirements/RequirementsCanvas'
import { GherkinEditor } from '@/components/requirements/GherkinEditor'
import { FlowSimulator } from '@/components/requirements/FlowSimulator'
import { requirementsApi } from '@/lib/api/requirements'
import { RequirementWithSteps, RequirementConnection } from '@/lib/types/requirement'

export default function RequirementsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [requirements, setRequirements] = useState<RequirementWithSteps[]>([])
  const [connections, setConnections] = useState<RequirementConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingRequirement, setEditingRequirement] = useState<RequirementWithSteps | null>(null)
  const [highlightedReqId, setHighlightedReqId] = useState<string | null>(null)
  const [highlightedStepIndex, setHighlightedStepIndex] = useState<number | null>(null)

  useEffect(() => {
    loadRequirements()
    loadConnections()
  }, [projectId])

  const loadRequirements = async () => {
    try {
      const response = await requirementsApi.list(projectId)
      setRequirements(response.data)
    } catch (error) {
      console.error('Failed to load requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConnections = async () => {
    try {
      const response = await requirementsApi.listConnections(projectId)
      setConnections(response.data)
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const handleCreateRequirement = async (
    title: string,
    description: string,
    gherkin: string
  ) => {
    try {
      await requirementsApi.create(projectId, {
        title,
        description: description || undefined,
        gherkinScenario: gherkin,
      })
      setShowEditor(false)
      loadRequirements()
    } catch (error: any) {
      alert(`Failed to create requirement: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleUpdateRequirement = async (
    title: string,
    description: string,
    gherkin: string
  ) => {
    if (!editingRequirement) return

    try {
      await requirementsApi.update(editingRequirement.requirement.id, {
        title,
        description: description || undefined,
        gherkinScenario: gherkin,
      })
      setShowEditor(false)
      setEditingRequirement(null)
      loadRequirements()
    } catch (error: any) {
      alert(`Failed to update requirement: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleEditRequirement = (requirementId: string) => {
    const req = requirements.find((r) => r.requirement.id === requirementId)
    if (req) {
      setEditingRequirement(req)
      setShowEditor(true)
    }
  }

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return

    try {
      await requirementsApi.delete(requirementId)
      loadRequirements()
    } catch (error) {
      console.error('Failed to delete requirement:', error)
    }
  }

  const handleNodesChange = async (nodes: Node[]) => {
    // Update positions on the backend
    for (const node of nodes) {
      const requirement = requirements.find((r) => r.requirement.id === node.id)
      if (requirement && node.position) {
        try {
          await requirementsApi.update(node.id, {
            positionX: node.position.x,
            positionY: node.position.y,
          })
        } catch (error) {
          console.error('Failed to update position:', error)
        }
      }
    }
  }

  const handleConnect = async (sourceId: string, targetId: string) => {
    try {
      await requirementsApi.createConnection(projectId, {
        sourceRequirementId: sourceId,
        targetRequirementId: targetId,
      })
      loadConnections()
    } catch (error) {
      console.error('Failed to create connection:', error)
    }
  }

  const handleEdgeDelete = async (connectionId: string) => {
    try {
      await requirementsApi.deleteConnection(connectionId)
      loadConnections()
    } catch (error) {
      console.error('Failed to delete connection:', error)
    }
  }

  const handleNewRequirement = () => {
    setEditingRequirement(null)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingRequirement(null)
  }

  const handleHighlight = (requirementId: string | null, stepIndex: number | null) => {
    setHighlightedReqId(requirementId)
    setHighlightedStepIndex(stepIndex)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (showEditor) {
    return (
      <div className="flex items-center justify-center p-8">
        <GherkinEditor
          projectId={projectId}
          initialTitle={editingRequirement?.requirement.title}
          initialDescription={editingRequirement?.requirement.description}
          initialGherkin={editingRequirement?.requirement.gherkinScenario}
          onSave={
            editingRequirement ? handleUpdateRequirement : handleCreateRequirement
          }
          onCancel={handleCloseEditor}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Requirements</h1>
          <p className="text-gray-600 mt-1">
            Visual Gherkin requirements editor with domain integration
          </p>
        </div>
        <Button onClick={handleNewRequirement}>Create Requirement</Button>
      </div>

      {requirements.length === 0 ? (
        <div className="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Requirements Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first requirement using Gherkin syntax
            </p>
            <Button onClick={handleNewRequirement}>Create Requirement</Button>
          </div>
        </div>
      ) : (
        <>
          <FlowSimulator
            requirements={requirements}
            connections={connections}
            onHighlight={handleHighlight}
          />
          <div className="flex-1 border rounded-lg bg-white" style={{ height: '600px' }}>
            <RequirementsCanvas
              requirements={requirements}
              connections={connections}
              onNodeClick={(id) => console.log('Clicked:', id)}
              onNodeEdit={handleEditRequirement}
              onNodeDelete={handleDeleteRequirement}
              onNodesChange={handleNodesChange}
              onConnect={handleConnect}
              onEdgeDelete={handleEdgeDelete}
              highlightedReqId={highlightedReqId}
              highlightedStepIndex={highlightedStepIndex}
            />
          </div>
        </>
      )}
    </div>
  )
}
