import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createEditor, Descendant, Editor, Transforms, Range, Element as SlateElement, BaseEditor, Node, Point, Path } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { CommentSystem } from './CommentSystem'
import { usePageStore } from '../../store/page-store'
import { useAppStore } from '../../store/app-store'

// Define custom types - UPDATED with new element types
type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  highlight?: boolean
  color?: string
}

type TitleElement = {
  type: 'title'
  children: CustomText[]
}

type ParagraphElement = {
  type: 'paragraph'
  align?: string
  children: CustomText[]
}

type HeadingOneElement = {
  type: 'heading-one'
  align?: string
  children: CustomText[]
}

type HeadingTwoElement = {
  type: 'heading-two'
  align?: string
  children: CustomText[]
}

type HeadingThreeElement = {
  type: 'heading-three'
  align?: string
  children: CustomText[]
}

type BlockQuoteElement = {
  type: 'block-quote'
  align?: string
  children: CustomText[]
}

type NumberedListElement = {
  type: 'numbered-list'
  children: ListItemElement[]
}

type BulletedListElement = {
  type: 'bulleted-list'
  children: ListItemElement[]
}

type ListItemElement = {
  type: 'list-item'
  children: CustomText[]
}

type CodeBlockElement = {
  type: 'code-block'
  children: CustomText[]
}

// NEW TYPES - Added for table, link, image support
type LinkElement = {
  type: 'link'
  url: string
  children: CustomText[]
}

type ImageElement = {
  type: 'image'
  url: string
  children: CustomText[]
}

type TableElement = {
  type: 'table'
  children: TableRowElement[]
}

type TableRowElement = {
  type: 'table-row'
  children: TableCellElement[]
}

type TableCellElement = {
  type: 'table-cell'
  children: CustomElement[]
}

// Updated CustomElement type - includes all new types
type CustomElement =
  | TitleElement
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | BlockQuoteElement
  | NumberedListElement
  | BulletedListElement
  | ListItemElement
  | CodeBlockElement
  | LinkElement
  | ImageElement
  | TableElement
  | TableRowElement
  | TableCellElement

type CustomDescendant = CustomElement | CustomText

type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

// Module augmentation for Slate types - UPDATED
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

const createDefaultValue = (): CustomDescendant[] => [
  {
    type: 'title',
    children: [{ text: 'Welcome to the Plate Playground!' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Experience a modern rich-text editor built with ' },
      { text: 'Slate', bold: true, color: '#0066cc' },
      { text: ' and ' },
      { text: 'React', bold: true, color: '#0066cc' },
      { text: '. This playground showcases just a part of Plate\'s capabilities. ' },
      { text: 'Explore the documentation', bold: true, color: '#0066cc' },
      { text: ' to discover more.' }
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Moon is a Square', highlight: true },
      { text: '.' }
    ],
  },
]

const normalizeValue = (value?: any[]): CustomDescendant[] => {
  if (!value || value.length === 0) {
    return createDefaultValue()
  }

  const normalizedValue = value.map(node => {
    if (!node.type) {
      return { type: 'paragraph', children: [{ text: node.text || '' }] }
    }
    if (!node.children || node.children.length === 0) {
      return { ...node, children: [{ text: '' }] }
    }
    return node
  })

  return normalizedValue as CustomDescendant[]
}

interface SlateEditorProps {
  value?: any[]
  pageId?: string
  className?: string
  readOnly?: boolean
}

export const SlateEditor: React.FC<SlateEditorProps> = ({
  value,
  pageId,
  className,
  readOnly = false
}) => {
  const normalizedValue = useMemo(() => normalizeValue(value), [value])
  const [editorValue, setEditorValue] = useState<CustomDescendant[]>(normalizedValue)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false)
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 })
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [factCheckResult, setFactCheckResult] = useState<{
    result: string
    confidence: number
    sources: string[]
    selectedText: string
    status: 'correct' | 'incorrect' | 'uncertain'
    statusIcon: string
  } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const { savePage, currentPage } = usePageStore()
  const { comments, addComment, removeCommentsInRange } = useAppStore()
  
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor())) as CustomEditor
    
    const { normalizeNode, isInline, onChange } = e
    
    e.onChange = () => {
      const { operations } = e
      
      operations.forEach(op => {
        if (op.type === 'remove_text' && 'offset' in op && 'text' in op) {
          const start = op.offset
          const end = start + op.text.length
          removeCommentsInRange(start, end)
        }
      })
      
      onChange()
    }
    
    e.normalizeNode = (entry) => {
      const [node, path] = entry

      if (SlateElement.isElement(node)) {
        if ((node as CustomElement).children.length === 0) {
          const emptyText = { text: '' }
          Transforms.insertNodes(e, emptyText, { at: [...path, 0] })
          return
        }

        for (const [child, childPath] of Node.children(e, path)) {
          if (SlateElement.isElement(child) && (child as CustomElement).children.length === 0) {
            const emptyText = { text: '' }
            Transforms.insertNodes(e, emptyText, { at: [...childPath, 0] })
            return
          }
        }
      }

      normalizeNode(entry)
    }

    e.isInline = element => {
      return ['link'].includes((element as CustomElement).type) || isInline(element)
    }

    // ADDED: Handle void elements (images)
    e.isVoid = element => {
      return ['image'].includes((element as CustomElement).type)
    }
    
    return e
  }, [removeCommentsInRange])

  useEffect(() => {
    const newValue = normalizeValue(value)
    setEditorValue(newValue)
  }, [value])

  useEffect(() => {
    if (!pageId || !currentPage || readOnly) return

    const timeoutId = setTimeout(() => {
      savePage(pageId, editorValue)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [editorValue, pageId, savePage, currentPage, readOnly])

  const handleChange = useCallback((newValue: CustomDescendant[]) => {
    setEditorValue(newValue)
  }, [])

  // UPDATED renderElement function with all new element types
  const renderElement = useCallback((props: any) => {
    const style: React.CSSProperties = {}
    
    // Add text alignment if present
    if (props.element.align) {
      style.textAlign = props.element.align
    }

    switch (props.element.type) {
      case 'title':
        return <h1 className="text-4xl font-bold mb-6 text-center" style={style} {...props.attributes}>{props.children}</h1>
      case 'paragraph':
        return <p className="mb-4 leading-relaxed" style={style} {...props.attributes}>{props.children}</p>
      case 'heading-one':
        return <h1 className="text-3xl font-bold mb-4" style={style} {...props.attributes}>{props.children}</h1>
      case 'heading-two':
        return <h2 className="text-2xl font-semibold mb-3" style={style} {...props.attributes}>{props.children}</h2>
      case 'heading-three':
        return <h3 className="text-xl font-medium mb-2" style={style} {...props.attributes}>{props.children}</h3>
      case 'block-quote':
        return <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" style={style} {...props.attributes}>{props.children}</blockquote>
      case 'numbered-list':
        return <ol className="list-decimal list-inside mb-4" {...props.attributes}>{props.children}</ol>
      case 'bulleted-list':
        return <ul className="list-disc list-inside mb-4" {...props.attributes}>{props.children}</ul>
      case 'list-item':
        return <li className="mb-1" {...props.attributes}>{props.children}</li>
      case 'code-block':
        return <pre className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-4 overflow-auto" {...props.attributes}><code>{props.children}</code></pre>
      
      // NEW ELEMENTS - Added rendering for table, link, image
      case 'link':
        return (
          <a 
            {...props.attributes} 
            href={props.element.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {props.children}
          </a>
        )
      case 'image':
        return (
          <div {...props.attributes}>
            <div contentEditable={false}>
              <img 
                src={props.element.url} 
                style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '1rem 0' }}
                alt="Inserted image"
              />
            </div>
            {props.children}
          </div>
        )
      case 'table':
        return (
          <table 
            {...props.attributes} 
            style={{ 
              borderCollapse: 'collapse', 
              border: '1px solid #ccc', 
              margin: '1rem 0', 
              width: '100%' 
            }}
          >
            <tbody>{props.children}</tbody>
          </table>
        )
      case 'table-row':
        return <tr {...props.attributes}>{props.children}</tr>
      case 'table-cell':
        return (
          <td 
            {...props.attributes} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '8px', 
              minWidth: '100px',
              minHeight: '40px'
            }}
          >
            {props.children}
          </td>
        )
      
      default:
        return <p className="mb-4" style={style} {...props.attributes}>{props.children}</p>
    }
  }, [])

  const renderLeaf = useCallback((props: any) => {
    let children = props.children

    if (props.leaf.bold) {
      children = <strong>{children}</strong>
    }
    if (props.leaf.italic) {
      children = <em>{children}</em>
    }
    if (props.leaf.underline) {
      children = <u>{children}</u>
    }
    if (props.leaf.strikethrough) {
      children = <del>{children}</del>
    }
    if (props.leaf.code) {
      children = <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{children}</code>
    }
    if (props.leaf.highlight) {
      children = <mark className="bg-blue-200 px-1 rounded">{children}</mark>
    }
    if (props.leaf.color) {
      children = <span style={{ color: props.leaf.color }}>{children}</span>
    }

    return <span {...props.attributes}>{children}</span>
  }, [])

  const updateFloatingToolbarPosition = useCallback(() => {
    try {
      const { selection } = editor
      if (!selection || Range.isCollapsed(selection)) return

      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0) return

      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()
      const editorElement = editorRef.current

      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect()
        setFloatingToolbarPosition({
          top: rect.top - editorRect.top - 60,
          left: rect.left - editorRect.left
        })
      }
    } catch (error) {
      console.error('Error updating floating toolbar position:', error)
    }
  }, [editor])

  const getTextOffset = useCallback((point: Point) => {
    try {
      const path = point.path
      const offset = point.offset
      let totalOffset = 0
      
      for (let i = 0; i < path[0]; i++) {
        const node = editorValue[i]
        if (node && SlateElement.isElement(node)) {
          totalOffset += Node.string(node).length + 1 
        }
      }
      
      totalOffset += offset
      return totalOffset
    } catch (error) {
      return 0
    }
  }, [editorValue])

  const handleSelectionChange = useCallback(() => {
    try {
      const { selection } = editor
      if (selection && Range.isCollapsed(selection)) {
        setSelectedText('')
        setSelectionRange(null)
        setShowFloatingToolbar(false)
      } else if (selection) {
        const text = Editor.string(editor, selection)
        const start = getTextOffset(selection.anchor)
        const end = getTextOffset(selection.focus)
        
        setSelectedText(text)
        setSelectionRange({ 
          start: Math.min(start, end), 
          end: Math.max(start, end) 
        })
        setShowFloatingToolbar(text.length > 0)
        
        if (text.length > 0) {
          setTimeout(updateFloatingToolbarPosition, 10)
        }
      }
    } catch (error) {
      console.error('Selection change error:', error)
      setSelectedText('')
      setSelectionRange(null)
      setShowFloatingToolbar(false)
    }
  }, [editor, updateFloatingToolbarPosition, getTextOffset])

  const handleAIFactCheck = async () => {
    if (!selectedText.trim() || !selectionRange) return
    
    setIsFactChecking(true)
    try {
      console.log('Sending fact-check request for:', selectedText)
      
      const response = await fetch('http://localhost:8000/api/ai/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Fact check result:', result)
      
      addComment({
        id: Date.now().toString(),
        text: result.result,
        author: 'AI',
        confidence: result.confidence,
        sources: result.sources || [],
        timestamp: new Date().toISOString(),
        selectedText: selectedText,
        position: selectionRange
      })
      
      setShowFloatingToolbar(false)
      setSelectedText('')
      setSelectionRange(null)
      
    } catch (error) {
  
      addComment({
        id: Date.now().toString(),
        text: 'Fact check failed. Please make sure the backend server is running.',
        author: 'AI',
        confidence: 0,
        sources: [],
        timestamp: new Date().toISOString(),
        selectedText: selectedText,
        position: selectionRange
      })
    } finally {
      setIsFactChecking(false)
    }
  }

  return (
    <div className={`p-4 max-w-full ${className}`}>
      <Slate 
        editor={editor} 
        initialValue={editorValue} 
        onChange={handleChange}
        key={pageId}
      >
        {!readOnly && <EditorToolbar onFactCheck={handleAIFactCheck} isFactChecking={isFactChecking} />}
        
        <div className="relative" ref={editorRef}>
          <div className="border border-gray-200 rounded-lg p-6 min-h-[500px] focus-within:border-blue-500 transition-colors">
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Start typing here..."
              className="focus:outline-none"
              onSelect={handleSelectionChange}
              readOnly={readOnly}
              style={{ minHeight: '400px' }}
            />
          </div>
          
          {showFloatingToolbar && !readOnly && (
            <div 
              style={{
                position: 'absolute',
                top: `${floatingToolbarPosition.top}px`,
                left: `${floatingToolbarPosition.left}px`,
                zIndex: 1000
              }}
            >
              <FloatingToolbar 
                selectedText={selectedText}
                onFactCheck={handleAIFactCheck}
                isFactChecking={isFactChecking}
              />
            </div>
          )}
        </div>
      </Slate>
      
      {/* Fact Check Result Card */}
      {factCheckResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{factCheckResult.statusIcon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Fact Check Result
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    factCheckResult.status === 'correct' 
                      ? 'bg-green-100 text-green-800' 
                      : factCheckResult.status === 'incorrect'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {factCheckResult.status.charAt(0).toUpperCase() + factCheckResult.status.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => setFactCheckResult(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Selected Text */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Text:</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md border italic">
                  "{factCheckResult.selectedText}"
                </p>
              </div>
              
              {/* Analysis */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis:</h4>
                <p className="text-gray-900 leading-relaxed">
                  {factCheckResult.result}
                </p>
              </div>
              
              {/* Confidence */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Confidence:</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        factCheckResult.confidence >= 0.8 
                          ? 'bg-green-500' 
                          : factCheckResult.confidence >= 0.6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${factCheckResult.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(factCheckResult.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Sources */}
              {factCheckResult.sources.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sources:</h4>
                  <ul className="space-y-1">
                    {factCheckResult.sources.map((source, index) => (
                      <li key={index} className="text-sm text-blue-600 hover:text-blue-800">
                        • {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFactCheckResult(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CommentSystem comments={comments} />
    </div>
  )
}