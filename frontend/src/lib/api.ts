/// <reference types="vite/client" />
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface Page {
  id: string
  title: string
  content: any[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  shareToken?: string
}


export interface FactCheckResponse {
  result: string
  confidence: number
  sources?: string[]
}

export const pageApi = {
  getAll: () => api.get<Page[]>('http://localhost:8000/api/pages'),
  getById: (id: string) => api.get<Page>(`http://localhost:8000/api/pages/${id}`),
  getByShareToken: (token: string) => api.get<Page>(`http://localhost:8000/api/pages/shared/${token}`),
  create: (data: { title: string }) => api.post<Page>('http://localhost:8000/api/pages', data),
  update: (id: string, data: { title?: string; content?: any[] }) =>
    api.put<Page>(`http://localhost:8000/api/pages/${id}`, data),
  delete: (id: string) => api.delete(`http://localhost:8000/api/pages/${id}`),
  share: (id: string) => api.post<{ shareToken: string }>(`http://localhost:8000/api/pages/${id}/share`),
  unshare: (id: string) => api.delete(`http://localhost:8000/api/pages/${id}/share`),
}

export const aiApi = {
  factCheck: (text: string) =>
    api.post<FactCheckResponse>('http://localhost:8000/api/ai/fact-check', { text }),
}

export default api