'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface OutdatedAlertProps {
  changedItems: string[]
  latestChangeDate: Date | null
  onRegenerate: () => void
  isGenerating?: boolean
}

export function OutdatedAlert({
  changedItems,
  latestChangeDate,
  onRegenerate,
  isGenerating,
}: OutdatedAlertProps) {
  return (
    <Card className="border-amber-300 bg-amber-50 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">
              Specification May Be Outdated
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Your project has been modified since the last specification was generated.
              {latestChangeDate && (
                <> Last change: {latestChangeDate.toLocaleString()}</>
              )}
            </p>
            <div className="text-sm text-amber-800 mb-4">
              <strong>Changed items:</strong> {changedItems.join(', ')}
            </div>
            <Button
              onClick={onRegenerate}
              disabled={isGenerating}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Regenerating...' : 'Regenerate Specification'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
