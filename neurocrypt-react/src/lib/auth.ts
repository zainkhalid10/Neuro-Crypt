import type { AuthUser } from '@/context/AuthContext'
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002'

type JsonBody = Record<string, unknown>

type FetchOptions = {
  method?: 'GET' | 'POST'
  body?: JsonBody
  token?: string | null
}

type ApiEnvelope<T> = T & {
  error?: string
  message?: string
}

async function authRequest<T>(
  path: string,
  { method = 'POST', body, token }: FetchOptions = {}
): Promise<T> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    })

    let data: ApiEnvelope<T>
    try {
      data = (await response.json()) as ApiEnvelope<T>
    } catch {
      data = {} as ApiEnvelope<T>
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error: Failed to connect to authentication server')
  }
}

export async function signupRequest(payload: {
  username: string
  email: string
  password: string
}) {
  return authRequest<{ token: string; user: AuthUser }>('/auth/signup', {
    body: payload
  })
}

export async function loginRequest(payload: {
  email: string
  password: string
}) {
  return authRequest<{ token: string; user: AuthUser }>('/auth/login', {
    body: payload
  })
}

export async function profileRequest(token: string) {
  return authRequest<{ user: AuthUser }>('/auth/me', { method: 'GET', token })
}

export { BACKEND_URL }

