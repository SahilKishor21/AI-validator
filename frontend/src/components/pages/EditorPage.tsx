import React, { useEffect } from 'react'
import { SlateEditor } from '../editor/SlateEditor'
import { usePageStore } from '../../store/page-store'
import { useAppStore } from '../../store/app-store'
import { Card } from '../ui/card'
import { FileText } from 'lucide-react'

export const EditorPage = () => {
  const { currentPage, isLoading, error } = usePageStore()
  const { clearComments } = useAppStore()

  useEffect(() => {
    clearComments()
  }, [currentPage?.id, clearComments])

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-full mx-auto">
          <Card className="min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading page...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-full mx-auto">
          <Card className="min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 mb-4">Error: {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Retry
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentPage) {
    return (
      <div className="flex-1 p-6 bg-background">
        <div className="max-w-full mx-auto">
          <Card className="min-h-[600px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No page selected</h3>
              <p>Select a page from the sidebar or create a new one to get started.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background">
      <SlateEditor 
        value={currentPage.content}
        pageId={currentPage.id}
        className="max-w-full"
      />
    </div>
  )
}