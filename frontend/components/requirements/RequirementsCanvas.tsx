'use client'

import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { RequirementNode } from './RequirementNode'
import { RequirementWithSteps } from '@/lib/types/requirement'

interface RequirementsCanvasProps {
  requirements: RequirementWithSteps[]
  connections: Array<{
    id: string
    sourceRequirementId: string
    targetRequirementId: string
  }>
  onNodeClick: (requirementId: string) => void
  onNodeEdit: (requirementId: string) => void
  onNodeDelete: (requirementId: string) => void
  onNodesChange: (nodes: Node[]) => void
  onConnect: (sourceId: string, targetId: string) => void
  onEdgeDelete: (connectionId: string) => void
  highlightedReqId?: string | null
  highlightedStepIndex?: number | null
}

export function RequirementsCanvas({
  requirements,
  connections,
  onNodeClick,
  onNodeEdit,
  onNodeDelete,
  onNodesChange,
  onConnect,
  onEdgeDelete,
  highlightedReqId,
  highlightedStepIndex,
}: RequirementsCanvasProps) {
  // Convert requirements to nodes
  const initialNodes: Node[] = requirements.map((req) => ({
    id: req.requirement.id,
    type: 'requirement',
    position: {
      x: req.requirement.positionX || Math.random() * 500,
      y: req.requirement.positionY || Math.random() * 500,
    },
    data: {
      title: req.requirement.title,
      steps: req.steps,
      onEdit: onNodeEdit,
      onDelete: onNodeDelete,
      highlighted: req.requirement.id === highlightedReqId,
      highlightedStepIndex: req.requirement.id === highlightedReqId ? highlightedStepIndex : null,
    },
  }))

  // Convert connections to edges
  const initialEdges: Edge[] = connections.map((conn) => ({
    id: conn.id,
    source: conn.sourceRequirementId,
    target: conn.targetRequirementId,
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }))

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)

  const nodeTypes = useMemo(() => ({ requirement: RequirementNode }), [])

  // Update node data when highlights change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          highlighted: node.id === highlightedReqId,
          highlightedStepIndex: node.id === highlightedReqId ? highlightedStepIndex : null,
        },
      }))
    )
  }, [highlightedReqId, highlightedStepIndex, setNodes])

  const onConnectHandler = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onConnect(params.source, params.target)
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: 'smoothstep',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
            },
            eds
          )
        )
      }
    },
    [onConnect, setEdges]
  )

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes)
      // Extract position changes and notify parent
      const movedNodes = changes
        .filter((change: any) => change.type === 'position' && change.position)
        .map((change: any) => ({
          id: change.id,
          ...change.position,
        }))

      if (movedNodes.length > 0) {
        const updatedNodes = nodes.map((node) => {
          const moved = movedNodes.find((m: any) => m.id === node.id)
          return moved ? { ...node, position: { x: moved.x, y: moved.y } } : node
        })
        onNodesChange(updatedNodes)
      }
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  )

  const handleEdgeDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        onEdgeDelete(edge.id)
      })
    },
    [onEdgeDelete]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnectHandler}
        onEdgesDelete={handleEdgeDelete}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return '#3b82f6'
          }}
          className="bg-gray-50"
        />
      </ReactFlow>
    </div>
  )
}
