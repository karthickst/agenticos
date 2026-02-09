import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { log } from '../logger'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

log.info('API Client initialized', { baseURL: API_BASE_URL })

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    const startTime = Date.now()
    config.metadata = { startTime }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        log.debug('Auth token added to request', {
          url: config.url,
          method: config.method,
        })
      }
    }

    // Log request
    log.api.request(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      {
        params: config.params,
        data: config.data,
        headers: config.headers,
      }
    )

    return config
  },
  (error: AxiosError) => {
    log.error('Request interceptor error', error, {
      config: error.config,
    })
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const config = response.config as any
    const duration = config.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined

    // Log successful response
    log.api.response(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      response.status,
      {
        data: response.data,
        headers: response.headers,
      },
      duration
    )

    return response
  },
  async (error: AxiosError) => {
    // Calculate request duration
    const config = error.config as any
    const duration = config?.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined

    // Log error with full details
    log.api.error(
      config?.method?.toUpperCase() || 'GET',
      config?.url || '',
      {
        ...error,
        duration,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      }
    )

    if (error.response?.status === 401) {
      log.warn('Unauthorized access, redirecting to login', {
        url: config?.url,
      })
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
}
