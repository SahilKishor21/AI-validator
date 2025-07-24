import { create } from 'zustand'

interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
  isResolved: boolean
  aiFactCheck?: {
    result: string
    confidence: number
    sources?: string[]
  }
}

interface EditorStore {
  selectedText: string
  comments: Record<string, Comment[]>
  isFactChecking: boolean
  
  setSelectedText: (text: string) => void
  addComment: (nodeId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void
  updateComment: (nodeId: string, commentId: string, updates: Partial<Comment>) => void
  deleteComment: (nodeId: string, commentId: string) => void
  setFactChecking: (checking: boolean) => void
  
  performFactCheck: (text: string, nodeId: string) => Promise<void>
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  selectedText: '',
  comments: {},
  isFactChecking: false,

  setSelectedText: (text) => set({ selectedText: text }),
  
  addComment: (nodeId, comment) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [nodeId]: [
          ...(state.comments[nodeId] || []),
          {
            ...comment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    })),

  updateComment: (nodeId, commentId, updates) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [nodeId]: state.comments[nodeId]?.map((comment) =>
          comment.id === commentId ? { ...comment, ...updates } : comment
        ),
      },
    })),

  deleteComment: (nodeId, commentId) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [nodeId]: state.comments[nodeId]?.filter((comment) => comment.id !== commentId),
      },
    })),

  setFactChecking: (checking) => set({ isFactChecking: checking }),

  performFactCheck: async (text: string, nodeId: string) => {
    const { setFactChecking, addComment } = get()
    setFactChecking(true)

    try {
      const response = await fetch('http://localhost:8000/api/ai/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Fact check failed')
      }

      const factCheckResult = await response.json()

      addComment(nodeId, {
        text: factCheckResult.result,
        author: 'AI Fact Checker',
        isResolved: false,
        aiFactCheck: {
          result: factCheckResult.result,
          confidence: factCheckResult.confidence,
          sources: factCheckResult.sources,
        },
      })
    } catch (error) {
      addComment(nodeId, {
        text: 'Failed to perform fact check. Please try again.',
        author: 'AI Fact Checker',
        isResolved: false,
        aiFactCheck: {
          result: 'Error occurred during fact checking',
          confidence: 0,
        },
      })
    } finally {
      setFactChecking(false)
    }
  },
}))