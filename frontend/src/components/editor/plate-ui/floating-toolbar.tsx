import React from 'react'
import { useSlate } from 'slate-react'
import { range } from 'slate'
import { AIPlugin } from '../plugins/ai-plugin'
import { CommentPlugin } from '../plugins/comment-plugin'
import { useEditorStore } from '../../../store/editor-store'
import { Card } from '../../ui/card'
import { Separator } from '../../ui/separator'

export const FloatingToolbar = () => {
  const editor = useSlate()
  const { selectedText } = useEditorStore()
  const selection = editor.selection
  
  if (!selection || !selectedText || Range.isCollapsed(selection)) {
    return null
  }

  return (
    <Card className="absolute z-50 p-2 shadow-lg">
      <div className="flex items-center gap-2">
        <AIPlugin nodeId="selected" selectedText={selectedText} />
        <Separator orientation="vertical" className="h-6" />
      </div>
      <CommentPlugin nodeId="selected" />
    </Card>
  )
}