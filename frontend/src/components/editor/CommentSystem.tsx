import React from 'react'
import { CheckCircle, X, AlertCircle, Brain } from 'lucide-react'
import { useAppStore } from '../../store/app-store'

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

interface CommentSystemProps {
  comments: Comment[]
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

export const CommentSystem: React.FC<CommentSystemProps> = ({ comments }) => {
  const { removeComment } = useAppStore()

  if (comments.length === 0) return null

  return (
    <div className="mt-6 space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
          <div className="flex items-start gap-3">
            {/* AI Avatar */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{comment.author}</span>
                <span className="text-sm text-gray-500">{formatTime(comment.timestamp)}</span>
                {comment.confidence !== undefined && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {Math.round(comment.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              
              {/* Selected Text */}
              <div className="text-sm text-gray-600 mb-2 bg-white/50 p-2 rounded border-l-2 border-blue-300">
                <strong>About:</strong> "{comment.selectedText}"
              </div>
              
              {/* AI Response */}
              <p className="text-gray-800 mb-3 leading-relaxed">{comment.text}</p>
              
              {/* Sources */}
              {comment.sources && comment.sources.length > 0 && (
                <div className="text-xs text-gray-600 mb-3">
                  <strong>Sources:</strong> {comment.sources.join(', ')}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => removeComment(comment.id)}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as resolved
                </button>
                <span className="text-gray-300">|</span>
                <button className="text-sm text-gray-600 hover:text-gray-700 transition-colors">
                  Reply...
                </button>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => removeComment(comment.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              title="Remove comment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}