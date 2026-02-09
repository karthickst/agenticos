'use client'

import React, { Component, ReactNode } from 'react'
import { log } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with full stack trace
    log.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorInfo,
    })

    this.setState({
      error,
      errorInfo,
    })

    // Log to console for visibility
    console.error('Error Boundary Caught:', error)
    console.error('Component Stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Error:</h2>
                <pre className="bg-red-50 p-4 rounded text-sm overflow-auto text-red-800">
                  {this.state.error?.toString()}
                </pre>
              </div>
              {this.state.error?.stack && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2">Stack Trace:</h2>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              {this.state.errorInfo?.componentStack && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2">
                    Component Stack:
                  </h2>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
