import React from 'react'
import { useSlate } from 'slate-react'
import { Range } from 'slate'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Heading1, 
  Quote,
  List,
  ListOrdered,
  Brain,
  Loader2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { toggleMark, toggleBlock, isMarkActive, isBlockActive } from '../../hooks/use-editor'
import { cn } from '../../lib/utils'
import type { CustomEditor } from '../../lib/slate-types'

const ToolbarButton = ({ 
  active, 
  onMouseDown, 
  children,
  disabled = false
}: { 
  active?: boolean
  onMouseDown: (event: React.MouseEvent) => void
  children: React.ReactNode
  disabled?: boolean
}) => (
  <Button
    variant={active ? "default" : "ghost"}
    size="sm"
    onMouseDown={onMouseDown}
    disabled={disabled}
    className={cn("h-8 w-8 p-0")}
  >
    {children}
  </Button>
)

interface SlateToolbarProps {
  onFactCheck: () => void
  isFactChecking: boolean
}

export const SlateToolbar: React.FC<SlateToolbarProps> = ({ onFactCheck, isFactChecking }) => {
  const editor = useSlate() as CustomEditor
  const { selection } = editor
  const hasSelection = selection && !Range.isCollapsed(selection)

  return (
    <div className="flex items-center space-x-1">
      <ToolbarButton
        active={isMarkActive(editor, 'bold')}
        onMouseDown={event => {
          event.preventDefault()
          toggleMark(editor, 'bold')
        }}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive(editor, 'italic')}
        onMouseDown={event => {
          event.preventDefault()
          toggleMark(editor, 'italic')
        }}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive(editor, 'underline')}
        onMouseDown={event => {
          event.preventDefault()
          toggleMark(editor, 'underline')
        }}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive(editor, 'strikethrough')}
        onMouseDown={event => {
          event.preventDefault()
          toggleMark(editor, 'strikethrough')
        }}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive(editor, 'code')}
        onMouseDown={event => {
          event.preventDefault()
          toggleMark(editor, 'code')
        }}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton
        active={isBlockActive(editor, 'heading')}
        onMouseDown={event => {
          event.preventDefault()
          toggleBlock(editor, 'heading')
        }}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isBlockActive(editor, 'block-quote')}
        onMouseDown={event => {
          event.preventDefault()
          toggleBlock(editor, 'block-quote')
        }}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isBlockActive(editor, 'numbered-list')}
        onMouseDown={event => {
          event.preventDefault()
          toggleBlock(editor, 'numbered-list')
        }}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isBlockActive(editor, 'bulleted-list')}
        onMouseDown={event => {
          event.preventDefault()
          toggleBlock(editor, 'bulleted-list')
        }}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <ToolbarButton
        disabled={!hasSelection || isFactChecking}
        onMouseDown={event => {
          event.preventDefault()
          onFactCheck()
        }}
      >
        {isFactChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </ToolbarButton>
    </div>
  )
}