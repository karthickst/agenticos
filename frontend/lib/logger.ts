// Simple logger that works in both browser and server
const isBrowser = typeof window !== 'undefined'

interface LogData {
  [key: string]: any
}

class Logger {
  private logLevel: string

  constructor() {
    this.logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'debug'
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`
  }

  private writeToFile(level: string, message: string, data?: any) {
    if (!isBrowser) {
      // Server-side logging to file
      const formatted = this.formatMessage(level, message, data)
      try {
        const fs = require('fs')
        const path = require('path')
        const logsDir = path.join(process.cwd(), 'logs')

        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true })
        }

        const logFile = path.join(logsDir, 'frontend.log')
        fs.appendFileSync(logFile, formatted + '\n')
      } catch (error) {
        console.error('Failed to write to log file:', error)
      }
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevel = levels.indexOf(this.logLevel)
    const messageLevel = levels.indexOf(level)
    return messageLevel >= currentLevel
  }

  info(message: string, data?: any) {
    if (!this.shouldLog('info')) return

    const formatted = this.formatMessage('info', message, data)
    console.info(formatted)
    this.writeToFile('info', message, data)
  }

  error(message: string, error?: any, data?: any) {
    if (!this.shouldLog('error')) return

    const errorDetails = error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
          ...error,
        }
      : undefined

    const combinedData = { ...data, error: errorDetails }
    const formatted = this.formatMessage('error', message, combinedData)

    console.error(formatted)
    if (error?.stack) {
      console.error('Stack trace:', error.stack)
    }

    this.writeToFile('error', message, combinedData)
  }

  warn(message: string, data?: any) {
    if (!this.shouldLog('warn')) return

    const formatted = this.formatMessage('warn', message, data)
    console.warn(formatted)
    this.writeToFile('warn', message, data)
  }

  debug(message: string, data?: any) {
    if (!this.shouldLog('debug')) return

    const formatted = this.formatMessage('debug', message, data)
    console.debug(formatted)
    this.writeToFile('debug', message, data)
  }

  api = {
    request: (method: string, url: string, data?: any) => {
      const message = `API Request: ${method} ${url}`
      this.info(message, {
        type: 'api_request',
        method,
        url,
        data,
        timestamp: new Date().toISOString(),
      })
    },

    response: (method: string, url: string, status: number, data?: any, duration?: number) => {
      const message = `API Response: ${method} ${url} - ${status} (${duration}ms)`
      this.info(message, {
        type: 'api_response',
        method,
        url,
        status,
        data,
        duration,
        timestamp: new Date().toISOString(),
      })
    },

    error: (method: string, url: string, error: any) => {
      const message = `API Error: ${method} ${url}`
      this.error(message, error, {
        type: 'api_error',
        method,
        url,
        timestamp: new Date().toISOString(),
      })
    },
  }

  component = {
    mount: (componentName: string, props?: any) => {
      this.debug(`Component Mounted: ${componentName}`, {
        type: 'component_mount',
        componentName,
        props,
      })
    },

    unmount: (componentName: string) => {
      this.debug(`Component Unmounted: ${componentName}`, {
        type: 'component_unmount',
        componentName,
      })
    },

    render: (componentName: string, props?: any) => {
      this.debug(`Component Render: ${componentName}`, {
        type: 'component_render',
        componentName,
        props,
      })
    },

    error: (componentName: string, error: Error, errorInfo?: any) => {
      this.error(`Component Error: ${componentName}`, error, {
        type: 'component_error',
        componentName,
        errorInfo,
      })
    },
  }

  user = {
    action: (action: string, data?: any) => {
      this.info(`User Action: ${action}`, {
        type: 'user_action',
        action,
        data,
        timestamp: new Date().toISOString(),
      })
    },
  }
}

export const log = new Logger()
export default log
