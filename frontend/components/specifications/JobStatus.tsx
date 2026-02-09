'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SpecificationJob, JOB_STATUSES } from '@/lib/types/specification'

interface JobStatusProps {
  job: SpecificationJob
}

export function JobStatus({ job }: JobStatusProps) {
  const statusInfo = JOB_STATUSES.find((s) => s.value === job.status)

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Generation Status</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusInfo?.color || 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusInfo?.label || job.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-medium text-gray-900">{job.claudeModel}</span>
            </div>
            <div className="flex justify-between">
              <span>Started:</span>
              <span className="font-medium text-gray-900">
                {new Date(job.createdAt).toLocaleString()}
              </span>
            </div>
            {job.completedAt && (
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium text-gray-900">
                  {new Date(job.completedAt).toLocaleString()}
                </span>
              </div>
            )}
            {job.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <div className="font-medium mb-1">Error:</div>
                <div className="text-sm">{job.errorMessage}</div>
              </div>
            )}
          </div>

          {job.status === 'processing' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full" />
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Claude is analyzing your project and generating the specification...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
