import React from 'react'
import { useSlate } from 'slate-react'
import { Editor, Transforms, Element as SlateElement, BaseEditor, Range } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Brain,
  Loader2,
} from 'lucide-react'

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

const ToolbarButton = ({ active, onMouseDown, children, title, disabled = false }: {
  active?: boolean
  onMouseDown: (event: React.MouseEvent) => void
  children: React.ReactNode
  title: string
  disabled?: boolean
}) => (
  <button
    title={title}
    onMouseDown={onMouseDown}
    disabled={disabled}
    className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 dark:text-white'
    }`}
  >
    {children}
  </button>
)

const Separator = () => <div className="w-px h-6 bg-gray-300 mx-1 dark:bg-gray-600" />

interface EditorToolbarProps {
  onFactCheck?: () => void
  isFactChecking?: boolean
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  onFactCheck, 
  isFactChecking = false 
}) => {
  const editor = useSlate() as CustomEditor
  const { selection } = editor
  const hasSelection = selection && !Range.isCollapsed(selection)

  const isMarkActive = (format: string) => {
    const marks = Editor.marks(editor)
    return marks ? (marks as Record<string, unknown>)[format] === true : false
  }

  const isBlockActive = (format: string) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          'type' in n &&
          typeof (n as { type: string }).type === 'string' &&
          (n as { type: string }).type === format,
      })
    )

    return !!match
  }

  const isAlignmentActive = (alignment: string) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          'align' in n &&
          (n as any).align === alignment,
      })
    )

    return !!match
  }

  const toggleMark = (format: string) => {
    const isActive = isMarkActive(format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(format)
    const isList = ['numbered-list', 'bulleted-list'].includes(format)

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        typeof (n as any).type === 'string' &&
        ['numbered-list', 'bulleted-list'].includes((n as any).type),
      split: true,
    })

    const newType = isActive ? 'paragraph' : isList ? 'list-item' : format
    Transforms.setNodes<SlateElement>(editor, { type: newType } as any)

    if (!isActive && isList) {
      const block = { type: format as 'numbered-list' | 'bulleted-list', children: [] }
      Transforms.wrapNodes(editor, block as any)
    }
  }

  const handleUndo = () => {
    HistoryEditor.undo(editor)
  }

  const handleRedo = () => {
    HistoryEditor.redo(editor)
  }

  const insertLink = () => {
    const url = window.prompt('Enter the URL:')
    if (!url) return

    const { selection } = editor
    const isCollapsed = selection && Range.isCollapsed(selection)
    const link = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : [],
    }

    if (isCollapsed) {
      Transforms.insertNodes(editor, link as any)
    } else {
      Transforms.wrapNodes(editor, link as any, { split: true })
      Transforms.collapse(editor, { edge: 'end' })
    }
  }

  const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const image = {
          type: 'image',
          url: reader.result as string,
          children: [{ text: '' }],
        }
        Transforms.insertNodes(editor, image as any)
      }
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  const insertTable = () => {
    const rows = window.prompt('Number of rows:', '3')
    const cols = window.prompt('Number of columns:', '3')
    
    if (!rows || !cols) return

    const numRows = parseInt(rows)
    const numCols = parseInt(cols)

    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) return

    const tableRows = Array.from({ length: numRows }, () => ({
      type: 'table-row',
      children: Array.from({ length: numCols }, () => ({
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      })),
    }))

    const table = {
      type: 'table',
      children: tableRows,
    }

    Transforms.insertNodes(editor, table as any)
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as any)
  }

  const setAlignment = (alignment: string) => {
    const { selection } = editor
    if (!selection) return

    Transforms.unsetNodes(editor, 'align', {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    })

    if (alignment !== 'left') {
      Transforms.setNodes(
        editor,
        { align: alignment } as any,
        { 
          match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        }
      )
    }
  }

  return (
    <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex items-center gap-1 flex-wrap dark:bg-gray-800 dark:border-gray-700">
      <ToolbarButton
        title="Undo"
        onMouseDown={(e) => {
          e.preventDefault()
          handleUndo()
        }}
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        title="Redo"
        onMouseDown={(e) => {
          e.preventDefault()
          handleRedo()
        }}
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <Separator />

      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-600"
        onChange={(e) => {
          const value = e.target.value
          if (value === 'paragraph') {
            toggleBlock('paragraph')
          } else {
            toggleBlock(value)
          }
        }}
      >
        <option value="paragraph">Text</option>
        <option value="heading-one">Heading 1</option>
        <option value="heading-two">Heading 2</option>
        <option value="heading-three">Heading 3</option>
      </select>

      <Separator />

      <ToolbarButton
        active={isMarkActive('bold')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('bold')
        }}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive('italic')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('italic')
        }}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive('underline')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('underline')
        }}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive('strikethrough')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('strikethrough')
        }}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isMarkActive('code')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('code')
        }}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={isBlockActive('block-quote')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock('block-quote')
        }}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isBlockActive('numbered-list')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock('numbered-list')
        }}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isBlockActive('bulleted-list')}
        onMouseDown={(e) => {
          e.preventDefault()
          toggleBlock('bulleted-list')
        }}
        title="Bulleted List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault()
          insertLink()
        }}
        title="Link"
      >
        <Link className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault()
          insertImage()
        }}
        title="Image"
      >
        <Image className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onMouseDown={(e) => {
          e.preventDefault()
          insertTable()
        }}
        title="Table"
      >
        <Table className="w-4 h-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={isAlignmentActive('left')}
        onMouseDown={(e) => {
          e.preventDefault()
          setAlignment('left')
        }}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isAlignmentActive('center')}
        onMouseDown={(e) => {
          e.preventDefault()
          setAlignment('center')
        }}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        active={isAlignmentActive('right')}
        onMouseDown={(e) => {
          e.preventDefault()
          setAlignment('right')
        }}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      {onFactCheck && (
        <>
          <Separator />
          <ToolbarButton
            disabled={!hasSelection || isFactChecking}
            onMouseDown={(e) => {
              e.preventDefault()
              onFactCheck()
            }}
            title="AI Fact Check"
          >
            {isFactChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
          </ToolbarButton>
        </>
      )}
    </div>
  )
}