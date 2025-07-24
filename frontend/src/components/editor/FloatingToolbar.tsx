import React from 'react'
import { Brain, Bold, Italic, Underline, Strikethrough, Code, MoreHorizontal, Loader2 } from 'lucide-react'
import { useSlate } from 'slate-react'
import { Editor } from 'slate'

interface FloatingToolbarProps {
  selectedText: string
  onFactCheck: () => void
  isFactChecking?: boolean
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedText,
  onFactCheck,
  isFactChecking = false
}) => {
  const editor = useSlate()

  const isMarkActive = (format: string) => {
    const marks = Editor.marks(editor) as Record<string, any> | null
    return marks ? marks[format] === true : false
  }

  const toggleMark = (format: string) => {
    const isActive = isMarkActive(format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1 whitespace-nowrap dark:bg-gray-800 dark:border-gray-700">
      {/* Ask AI Button */}
      <button
        onClick={onFactCheck}
        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={!selectedText.trim() || isFactChecking}
        title="Ask AI"
      >
        {isFactChecking ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Brain className="w-3 h-3" />
        )}
        Ask AI
      </button>
      
      {/* Text Dropdown */}
      <select
        className="px-2 py-1 text-sm border-0 bg-transparent focus:outline-none dark:bg-gray-600 "
        aria-label="Text style"
        title="Text style"
      >
        <option>Text</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
      </select>
      
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('bold')
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isMarkActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        title="Bold"
      >
        <Bold className="w-3 h-3" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('italic')
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isMarkActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
      >
        <Italic className="w-3 h-3" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('underline')
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isMarkActive('underline') ? 'bg-gray-200' : ''}`}
        title="Underline"
      >
        <Underline className="w-3 h-3" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('strikethrough')
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isMarkActive('strikethrough') ? 'bg-gray-200' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3 h-3" />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault()
          toggleMark('code')
        }}
        className={`p-1 rounded hover:bg-gray-100 ${isMarkActive('code') ? 'bg-gray-200' : ''}`}
        title="Code"
      >
        <Code className="w-3 h-3" />
      </button>
      {/* More Options */}
      <button className="p-1 rounded hover:bg-gray-100" title="More options">
        <MoreHorizontal className="w-3 h-3" />
      </button>
    </div>
  )
}