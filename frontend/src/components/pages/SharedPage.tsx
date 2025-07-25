import React from 'react'
import { useParams } from 'react-router-dom'
import { SlateEditor } from '../editor/SlateEditor'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { initialValue } from '../../lib/slate-types'
import { Loader2, AlertCircle, FileText } from 'lucide-react'

// Use the same API base URL pattern as your page store
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://ai-validator-3.onrender.com/api' 
  : 'http://localhost:8000/api'

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
        console.log('API_BASE_URL:', API_BASE_URL)
        console.log('Full URL:', `${API_BASE_URL}/pages/shared/${token}`)
        
        // Use the full backend URL instead of relative URL
        const response = await fetch(`${API_BASE_URL}/pages/shared/${token}`)
        
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error response body:', errorText)
          
          if (response.status === 404) {
            throw new Error('Shared page not found or no longer available')
          }
          throw new Error(`Failed to load shared page: ${response.status} - ${errorText}`)
        }

        const pageData = await response.json()
        console.log('Loaded shared page:', pageData)
        
        // Validate the page data
        if (!pageData || !pageData.id) {
          throw new Error('Invalid page data received')
        }
        
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
        <Card className="max-w-md p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The shared link has expired</li>
                <li>The page is no longer public</li>
                <li>The page has been deleted</li>
                <li>Invalid share token</li>
              </ul>
              <p className="mt-2">Please contact the page owner for a new link.</p>
            </div>
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
          readOnly={true}
        />
      </main>
    </div>
  )
}