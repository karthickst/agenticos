'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react'
import { RequirementWithSteps } from '@/lib/types/requirement'

interface FlowSimulatorProps {
  requirements: RequirementWithSteps[]
  connections: any[]
  onHighlight: (requirementId: string | null, stepIndex: number | null) => void
}

export function FlowSimulator({
  requirements,
  connections,
  onHighlight,
}: FlowSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [executionPath, setExecutionPath] = useState<
    Array<{ requirementId: string; stepIndex: number; stepType: string; stepText: string }>
  >([])

  // Build execution path from connections
  useEffect(() => {
    const path: Array<{
      requirementId: string
      stepIndex: number
      stepType: string
      stepText: string
    }> = []

    // Find starting nodes (nodes with no incoming connections)
    const targetIds = new Set(connections.map((c) => c.targetRequirementId))
    const startingNodes = requirements.filter(
      (req) => !targetIds.has(req.requirement.id)
    )

    const visited = new Set<string>()

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return

      visited.add(nodeId)
      const req = requirements.find((r) => r.requirement.id === nodeId)
      if (!req) return

      // Add all steps of this requirement
      req.steps.forEach((step, index) => {
        path.push({
          requirementId: req.requirement.id,
          stepIndex: index,
          stepType: step.stepType,
          stepText: step.stepText,
        })
      })

      // Find outgoing connections
      const outgoing = connections.filter((c) => c.sourceRequirementId === nodeId)
      outgoing.forEach((conn) => traverse(conn.targetRequirementId))
    }

    // Traverse from each starting node
    startingNodes.forEach((node) => traverse(node.requirement.id))

    // If no starting nodes found, just traverse all requirements
    if (path.length === 0) {
      requirements.forEach((req) => {
        req.steps.forEach((step, index) => {
          path.push({
            requirementId: req.requirement.id,
            stepIndex: index,
            stepType: step.stepType,
            stepText: step.stepText,
          })
        })
      })
    }

    setExecutionPath(path)
  }, [requirements, connections])

  useEffect(() => {
    if (!isPlaying || currentIndex >= executionPath.length) {
      return
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 1500) // 1.5 seconds per step

    return () => clearTimeout(timer)
  }, [isPlaying, currentIndex, executionPath.length])

  useEffect(() => {
    if (currentIndex < executionPath.length) {
      const current = executionPath[currentIndex]
      onHighlight(current.requirementId, current.stepIndex)
    } else {
      onHighlight(null, null)
      if (isPlaying) {
        setIsPlaying(false)
      }
    }
  }, [currentIndex, executionPath, onHighlight])

  const handlePlay = () => {
    if (currentIndex >= executionPath.length) {
      setCurrentIndex(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    onHighlight(null, null)
  }

  const handleNext = () => {
    if (currentIndex < executionPath.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  if (executionPath.length === 0) {
    return null
  }

  const current = executionPath[currentIndex]
  const progress = ((currentIndex + 1) / executionPath.length) * 100

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Flow Simulation</h3>
            <div className="text-sm text-gray-600">
              Step {currentIndex + 1} of {executionPath.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Display */}
          {current && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {currentIndex + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {current.stepType}
                  </div>
                  <div className="text-sm text-gray-900">{current.stepText}</div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isPlaying}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {!isPlaying ? (
              <Button size="sm" onClick={handlePlay} disabled={currentIndex >= executionPath.length}>
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
            ) : (
              <Button size="sm" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= executionPath.length - 1 || isPlaying}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
