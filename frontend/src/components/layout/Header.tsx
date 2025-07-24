import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ThemeToggle } from './ThemeToggle'
import { usePageStore } from '../../store/page-store'
import { Share2, Plus, FileText, Loader2, Copy, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

export const Header = () => {
  const { currentPage, createPage, sharePagePublic, unsharePagePublic, isLoading } = usePageStore()
  const [isCreating, setIsCreating] = React.useState(false)
  const [newPageTitle, setNewPageTitle] = React.useState('')
  const [shareUrl, setShareUrl] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false)
  const [copySuccess, setCopySuccess] = React.useState(false)

  React.useEffect(() => {
    if (currentPage?.shareToken) {
      setShareUrl(`${window.location.origin}/shared/${currentPage.shareToken}`)
    } else {
      setShareUrl('')
    }
  }, [currentPage])

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return
    
    setIsCreating(true)
    try {
      await createPage(newPageTitle)
      setNewPageTitle('')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create page:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleShare = async () => {
    if (!currentPage) return
    
    try {
      if (currentPage.isPublic) {
        await unsharePagePublic(currentPage.id)
        setShareUrl('')
        setIsShareDialogOpen(false)
      } else {
        const token = await sharePagePublic(currentPage.id)
        const url = `${window.location.origin}/shared/${token}`
        setShareUrl(url)
        setIsShareDialogOpen(true)
      }
    } catch (error) {
      console.error('Failed to toggle sharing:', error)
      alert('Failed to share page. Please try again.')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy link')
    }
  }

  const handleTestShare = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-lg">AI Editor</span>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Page title..."
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating && newPageTitle.trim()) {
                      handleCreatePage()
                    }
                  }}
                />
                <Button 
                  onClick={handleCreatePage} 
                  disabled={isCreating || !newPageTitle.trim()}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Page'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          {currentPage && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {currentPage.title}
              </span>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className={`gap-2 ${currentPage.isPublic ? 'text-green-600' : ''}`}
                disabled={isLoading}
              >
                <Share2 className="h-4 w-4" />
                {currentPage.isPublic ? 'Shared' : 'Share'}
              </Button>

              {/* Share Dialog */}
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Page Shared Successfully!</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Your page "{currentPage.title}" is now publicly accessible. Anyone with this link can view it:
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="text-sm"
                      />
                      <Button 
                        onClick={handleCopyLink}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleTestShare}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Test Link
                      </Button>
                      <Button 
                        onClick={() => handleShare()}
                        variant="destructive"
                        size="sm"
                      >
                        Stop Sharing
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}