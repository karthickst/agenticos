'use client'

import { useEffect } from 'react'
import { log } from '@/lib/logger'

export function GlobalErrorHandler() {
  useEffect(() => {
    log.info('Application started', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    })

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      log.error('Unhandled Error', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
      })
      console.error('Unhandled Error:', event.error)
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      log.error('Unhandled Promise Rejection', event.reason, {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack,
      })
      console.error('Unhandled Promise Rejection:', event.reason)
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Log when user leaves the page
    const handleBeforeUnload = () => {
      log.info('User leaving application', {
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
