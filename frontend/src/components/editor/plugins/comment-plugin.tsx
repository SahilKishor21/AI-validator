import React from 'react'
import { useEditorStore } from '../../../store/editor-store'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Textarea } from '../../ui/textarea'
import { Badge } from '../../ui/badge'
import { Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface CommentPluginProps {
  nodeId: string
}

export const CommentPlugin: React.FC<CommentPluginProps> = ({ nodeId }) => {
  const { comments, addComment, updateComment, deleteComment } = useEditorStore()
  const [newComment, setNewComment] = React.useState('')

  const nodeComments = comments[nodeId] || []

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    addComment(nodeId, {
      text: newComment,
      author: 'User',
      isResolved: false,
    })
    setNewComment('')
  }

  const handleResolveComment = (commentId: string) => {
    updateComment(nodeId, commentId, { isResolved: true })
  }

  const handleDeleteComment = (commentId: string) => {
    deleteComment(nodeId, commentId)
  }

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          Add Comment
        </Button>
      </div>

      {nodeComments.length > 0 && (
        <div className="space-y-3">
          {nodeComments.map((comment) => (
            <Card key={comment.id} className={comment.isResolved ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {comment.author}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {comment.aiFactCheck && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        AI Check
                      </Badge>
                    )}
                    {comment.isResolved && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-3">{comment.text}</p>
                
                {comment.aiFactCheck && (
                  <div className="bg-accent/50 p-3 rounded-md mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default">
                        Confidence: {Math.round(comment.aiFactCheck.confidence * 100)}%
                      </Badge>
                    </div>
                    {comment.aiFactCheck.sources && (
                      <div className="text-xs text-muted-foreground">
                        Sources: {comment.aiFactCheck.sources.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {!comment.isResolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveComment(comment.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}