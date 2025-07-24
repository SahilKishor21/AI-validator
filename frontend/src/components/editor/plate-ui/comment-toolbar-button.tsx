import { MessageSquare } from 'lucide-react'
import { Button } from '../../ui/button'
import { useEditorStore } from '../../../store/editor-store'

export const CommentToolbarButton = () => {
  const { selectedText } = useEditorStore()

  return (
    <Button
      title="Add Comment"
      disabled={!selectedText}
      variant="ghost"
      size="icon"
    >
      <MessageSquare className="h-4 w-4" />
    </Button>
  )
}