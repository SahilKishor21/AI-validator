import React from 'react'
import { usePageStore } from '../../store/page-store'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react'

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown date'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString)
    return 'Invalid date'
  }
}

export const Sidebar = () => {
  const { 
    pages, 
    currentPage, 
    isLoading,
    loadPages,
    loadPage, 
    deletePage, 
    createPage 
  } = usePageStore()

  React.useEffect(() => {
    loadPages()
  }, [])

  const handlePageSelect = async (pageId: string) => {
    try {
      await loadPage(pageId)
    } catch (error) {
      console.error('Failed to load page:', error)
    }
  }

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage(pageId)
      } catch (error) {
        console.error('Failed to delete page:', error)
        alert('Failed to delete page. Please try again.')
      }
    }
  }

  const handleCreatePage = async () => {
    const title = prompt('Enter page title:')
    if (title?.trim()) {
      try {
        await createPage(title.trim())
      } catch (error) {
        console.error('Failed to create page:', error)
        alert('Failed to create page. Please try again.')
      }
    }
  }

  return (
    <div className="w-64 border-r bg-background">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pages</CardTitle>
            <Button size="sm" onClick={handleCreatePage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1 p-4">
              {isLoading && pages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p>Loading pages...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pages yet</p>
                  <p className="text-sm">Create your first page to get started</p>
                </div>
              ) : (
                pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => handlePageSelect(page.id)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer group hover:bg-accent transition-colors ${
                      currentPage?.id === page.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {page.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(page.updatedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeletePage(page.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}