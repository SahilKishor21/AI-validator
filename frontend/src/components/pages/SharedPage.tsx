import React from 'react'
import { useParams } from 'react-router-dom'
import { SlateEditor } from '../editor/SlateEditor'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { initialValue } from '../../lib/slate-types'
import { Loader2, AlertCircle, FileText } from 'lucide-react'

export const SharedPage = () => {
  const { token } = useParams<{ token: string }>()
  const [page, setPage] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadSharedPage = async () => {
      if (!token) {
        setError('Invalid share token')
        setLoading(false)
        return
      }

      try {
        console.log('Loading shared page with token:', token)
        const response = await fetch(`http://localhost:8000/api/pages/shared/${token}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Shared page not found or no longer available')
          }
          throw new Error('Failed to load shared page')
        }

        const pageData = await response.json()
        console.log('Loaded shared page:', pageData)
        setPage(pageData)
      } catch (err) {
        console.error('Error loading shared page:', err)
        setError(err instanceof Error ? err.message : 'Failed to load shared page')
      } finally {
        setLoading(false)
      }
    }

    loadSharedPage()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading shared page...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-full p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check the URL or contact the page owner.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="font-semibold">{page?.title || 'Shared Page'}</h1>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Read-only
            </span>
          </div>
        </div>
      </header>
      
      <main className="container py-6 px-4">
        <SlateEditor 
          value={page?.content || initialValue}
          className="max-w-full mx-auto"
        />
      </main>
    </div>
  )
}