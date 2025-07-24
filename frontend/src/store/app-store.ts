import { create } from 'zustand'

interface Comment {
  id: string
  text: string
  author: string
  confidence?: number
  sources?: string[]
  timestamp: string
  selectedText: string
  position: { start: number; end: number }
}

interface AppStore {
  comments: Comment[]
  addComment: (comment: Comment) => void
  removeComment: (id: string) => void
  removeCommentsInRange: (start: number, end: number) => void
  clearComments: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  comments: [],
  
  addComment: (comment) => 
    set((state) => ({ comments: [...state.comments, comment] })),
    
  removeComment: (id) =>
    set((state) => ({ comments: state.comments.filter(c => c.id !== id) })),
    
  removeCommentsInRange: (start, end) =>
    set((state) => ({
      comments: state.comments.filter(comment => {
        const { position } = comment
        return !(position.start < end && position.end > start)
      })
    })),
    
  clearComments: () => set({ comments: [] })
}))