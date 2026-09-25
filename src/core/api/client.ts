const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

function isErrorPayload(payload: unknown): payload is { error: string } {
  return typeof payload === 'object' && payload !== null && 'error' in payload
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload: unknown = isJson ? await res.json() : undefined

  if (!res.ok) {
    const message = isErrorPayload(payload) ? payload.error : `Error ${res.status}`
    throw new ApiError(res.status, message)
  }

  return payload as T
}
