'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Specification } from '@/lib/types/specification'
import { diffLines, Change } from 'diff'
import { X } from 'lucide-react'

interface DiffViewerProps {
  oldSpec: Specification
  newSpec: Specification
  onClose: () => void
}

export function DiffViewer({ oldSpec, newSpec, onClose }: DiffViewerProps) {
  const diff = diffLines(oldSpec.specificationText, newSpec.specificationText)

  const renderDiff = () => {
    return diff.map((part: Change, index: number) => {
      const backgroundColor = part.added
        ? 'bg-green-100'
        : part.removed
        ? 'bg-red-100'
        : 'bg-white'

      const textColor = part.added
        ? 'text-green-900'
        : part.removed
        ? 'text-red-900'
        : 'text-gray-900'

      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  '

      if (part.value.trim() === '') return null

      return (
        <div
          key={index}
          className={`${backgroundColor} ${textColor} px-4 py-1 font-mono text-sm border-l-4 ${
            part.added
              ? 'border-green-500'
              : part.removed
              ? 'border-red-500'
              : 'border-transparent'
          }`}
        >
          {part.value.split('\n').map((line, lineIndex) => (
            <div key={lineIndex}>
              {line && (
                <>
                  <span className="select-none opacity-50">{prefix}</span>
                  {line}
                </>
              )}
            </div>
          ))}
        </div>
      )
    })
  }

  const stats = diff.reduce(
    (acc, part: Change) => {
      const lines = part.value.split('\n').filter((l) => l.trim()).length
      if (part.added) acc.additions += lines
      if (part.removed) acc.deletions += lines
      return acc
    },
    { additions: 0, deletions: 0 }
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Specification Comparison</CardTitle>
            <CardDescription>
              Comparing Version {oldSpec.version} with Version {newSpec.version}
            </CardDescription>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-green-600">
                +{stats.additions} addition{stats.additions !== 1 ? 's' : ''}
              </span>
              <span className="text-red-600">
                -{stats.deletions} deletion{stats.deletions !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between text-sm">
            <div>
              <span className="text-gray-600">Old:</span>{' '}
              <span className="font-medium">
                v{oldSpec.version} ({oldSpec.claudeModel})
              </span>
            </div>
            <div>
              <span className="text-gray-600">New:</span>{' '}
              <span className="font-medium">
                v{newSpec.version} ({newSpec.claudeModel})
              </span>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">{renderDiff()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
