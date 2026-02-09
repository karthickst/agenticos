import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RequirementStep } from '@/lib/types/requirement'

interface RequirementNodeData {
  title: string
  steps: RequirementStep[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  highlighted?: boolean
  highlightedStepIndex?: number | null
}

const getStepColor = (stepType: string) => {
  switch (stepType) {
    case 'given':
      return 'text-blue-600'
    case 'when':
      return 'text-green-600'
    case 'then':
      return 'text-purple-600'
    case 'and':
      return 'text-gray-600'
    case 'but':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

const getStepKeyword = (stepType: string) => {
  return stepType.charAt(0).toUpperCase() + stepType.slice(1)
}

export const RequirementNode = memo(({ data, id }: NodeProps<RequirementNodeData>) => {
  const isHighlighted = data.highlighted
  const cardClass = isHighlighted
    ? 'w-80 shadow-2xl border-4 border-blue-500 bg-blue-50 animate-pulse'
    : 'w-80 shadow-lg hover:shadow-xl transition-shadow'

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Card className={cardClass}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-xs mb-3">
            {data.steps.slice(0, 5).map((step, idx) => {
              const isStepHighlighted =
                isHighlighted && data.highlightedStepIndex === idx
              return (
                <div
                  key={step.id || idx}
                  className={`flex gap-2 p-1 rounded ${
                    isStepHighlighted ? 'bg-blue-200 font-semibold' : ''
                  }`}
                >
                  <span className={`font-bold ${getStepColor(step.stepType)}`}>
                    {getStepKeyword(step.stepType)}
                  </span>
                  <span className="text-gray-700 line-clamp-1">{step.stepText}</span>
                </div>
              )
            })}
            {data.steps.length > 5 && (
              <div className="text-gray-400 text-xs">
                +{data.steps.length - 5} more steps...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit(id)
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                data.onDelete(id)
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  )
})

RequirementNode.displayName = 'RequirementNode'
