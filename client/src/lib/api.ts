import { supabase } from './supabase'

const API_BASE = '/api'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// API Keys
export interface ApiKeyStatus {
  service: string
  isSet: boolean
  maskedValue: string | null
  updatedAt: string | null
}

export const apiKeys = {
  list: () => apiRequest<ApiKeyStatus[]>('/api-keys'),
  set: (service: string, value: string) =>
    apiRequest<{ service: string; maskedValue: string }>(`/api-keys/${service}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
  delete: (service: string) =>
    apiRequest<{ deleted: boolean }>(`/api-keys/${service}`, { method: 'DELETE' }),
}

// Clients
export interface Client {
  id: string
  emoji: string
  business_name: string
  website_url: string | null
  created_at: string
  pageCount: number
}

export const clients = {
  list: () => apiRequest<Client[]>('/clients'),
  get: (id: string) => apiRequest<Client>(`/clients/${id}`),
  create: (data: { businessName: string; websiteUrl?: string; emoji?: string }) =>
    apiRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { businessName?: string; websiteUrl?: string; emoji?: string }) =>
    apiRequest<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ deleted: boolean }>(`/clients/${id}`, { method: 'DELETE' }),
}
