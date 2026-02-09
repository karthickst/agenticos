import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
            <p className="text-sm text-red-800 mb-4">{message}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorDisplay
        title="Failed to load page"
        message="We encountered an error while loading this page. Please try again."
        onRetry={onRetry}
      />
    </div>
  )
}
