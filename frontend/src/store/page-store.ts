import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Page {
  id: string
  title: string
  content: any[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  shareToken?: string
}

interface PageStore {
  pages: Page[]
  currentPage: Page | null
  isLoading: boolean
  error: string | null
  
  setPages: (pages: Page[]) => void
  setCurrentPage: (page: Page | null) => void
  addPage: (page: Page) => void
  updatePage: (id: string, updates: Partial<Page>) => void
  deletePage: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  createPage: (title: string) => Promise<void>
  loadPages: () => Promise<void>
  loadPage: (id: string) => Promise<void>
  savePage: (id: string, content: any[], title?: string) => Promise<void>
  sharePagePublic: (id: string) => Promise<string>
  unsharePagePublic: (id: string) => Promise<void>
}

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://ai-validator-3.onrender.com/api' 
  : 'http://localhost:8000/api'

// Helper function to normalize API response
const normalizePage = (apiPage: any): Page => {
  return {
    id: apiPage.id,
    title: apiPage.title,
    content: apiPage.content || [],
    createdAt: apiPage.createdAt || apiPage.created_at || new Date().toISOString(),
    updatedAt: apiPage.updatedAt || apiPage.updated_at || new Date().toISOString(),
    isPublic: apiPage.isPublic || apiPage.is_public || false,
    shareToken: apiPage.shareToken || apiPage.share_token || undefined
  }
}

export const usePageStore = create<PageStore>()(
  persist(
    (set, get) => ({
      pages: [],
      currentPage: null,
      isLoading: false,
      error: null,

      setPages: (pages) => set({ pages }),
      setCurrentPage: (page) => set({ currentPage: page }),
      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id ? { ...page, ...updates } : page
          ),
          currentPage:
            state.currentPage?.id === id
              ? { ...state.currentPage, ...updates }
              : state.currentPage,
        })),
      deletePage: async (id: string) => {
        const { setLoading, setError } = get()
        setLoading(true)
        setError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            throw new Error('Failed to delete page')
          }

          set((state) => ({
            pages: state.pages.filter((page) => page.id !== id),
            currentPage: state.currentPage?.id === id ? null : state.currentPage,
          }))

        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
          throw error
        } finally {
          setLoading(false)
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      createPage: async (title: string) => {
        const { setLoading, setError, addPage, setCurrentPage } = get()
        setLoading(true)
        setError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/pages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
          })

          if (!response.ok) {
            throw new Error('Failed to create page')
          }

          const apiPage = await response.json()
          const page = normalizePage(apiPage)
          addPage(page)
          setCurrentPage(page)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
          throw error
        } finally {
          setLoading(false)
        }
      },

      loadPages: async () => {
        const { setLoading, setError, setPages } = get()
        setLoading(true)
        setError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/pages`)
          if (!response.ok) {
            throw new Error('Failed to load pages')
          }

          const apiPages = await response.json()
          const pages = apiPages.map(normalizePage)
          setPages(pages)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
          console.error('Failed to load pages:', error)
        } finally {
          setLoading(false)
        }
      },

      loadPage: async (id: string) => {
        const { setLoading, setError, setCurrentPage } = get()
        setLoading(true)
        setError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/pages/${id}`)
          if (!response.ok) {
            throw new Error('Failed to load page')
          }

          const apiPage = await response.json()
          const page = normalizePage(apiPage)
          setCurrentPage(page)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
        } finally {
          setLoading(false)
        }
      },

      savePage: async (id: string, content: any[], title?: string) => {
        const { setError, updatePage } = get()
        setError(null)

        try {
          const body: any = { content }
          if (title !== undefined) {
            body.title = title
          }

          const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            throw new Error('Failed to save page')
          }

          const apiPage = await response.json()
          const updatedFields = {
            content: apiPage.content,
            title: apiPage.title,
            updatedAt: apiPage.updatedAt || apiPage.updated_at || new Date().toISOString()
          }
          updatePage(id, updatedFields)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
          console.error('Failed to save page:', error)
        }
      },

      sharePagePublic: async (id: string) => {
        const { setLoading, setError, updatePage } = get()
        setLoading(true)
        setError(null)

        try {
          console.log('Sharing page:', id)
          
          const response = await fetch(`${API_BASE_URL}/pages/${id}/share`, {
            method: 'POST',
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Share request failed:', response.status, errorText)
            throw new Error('Failed to share page')
          }

          const result = await response.json()
          console.log('Share response:', result)
          
          const shareToken = result.shareToken || result.share_token
          
          if (!shareToken) {
            throw new Error('No share token received')
          }
          
          updatePage(id, { isPublic: true, shareToken })
          console.log('Page updated with share token:', shareToken)
          
          return shareToken
        } catch (error) {
          console.error('Error sharing page:', error)
          setError(error instanceof Error ? error.message : 'Unknown error')
          throw error
        } finally {
          setLoading(false)
        }
      },

      unsharePagePublic: async (id: string) => {
        const { setLoading, setError, updatePage } = get()
        setLoading(true)
        setError(null)

        try {
          console.log('Unsharing page:', id)
          
          const response = await fetch(`${API_BASE_URL}/pages/${id}/share`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Unshare request failed:', response.status, errorText)
            throw new Error('Failed to unshare page')
          }

          console.log('Page unshared successfully')
          updatePage(id, { isPublic: false, shareToken: undefined })
        } catch (error) {
          console.error('Error unsharing page:', error)
          setError(error instanceof Error ? error.message : 'Unknown error')
          throw error
        } finally {
          setLoading(false)
        }
      },
    }),
    {
      name: 'page-storage',
      partialize: (state) => ({ 
        pages: state.pages,
      }),
    }
  )
)