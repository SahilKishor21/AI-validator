import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createEditor, Descendant, Editor, Transforms, Range, Element as SlateElement, BaseEditor, Node, Point, Path } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import { EditorToolbar } from './EditorToolbar'
import { FloatingToolbar } from './FloatingToolbar'
import { CommentSystem } from './CommentSystem'
import { usePageStore } from '../../store/page-store'
import { useAppStore } from '../../store/app-store'

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

  const renderElement = useCallback((props: any) => {
    const style: React.CSSProperties = {}
    
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
      
      const response = await fetch('https://ai-validator-3.onrender.com/api/ai/fact-check', {
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
      
      // Better parsing of the AI response
      let cleanResult = result.result
      let actualConfidence = result.confidence
      let actualSources = result.sources || []
      
      // If the result contains JSON, extract the actual content
      if (typeof cleanResult === 'string' && (cleanResult.includes('```json') || cleanResult.includes('"result":'))) {
        try {
          // Remove markdown code blocks
          let jsonStr = cleanResult
          if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim()
          } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim()
          }
          
          // Parse the JSON
          const parsedJson = JSON.parse(jsonStr)
          cleanResult = parsedJson.result || parsedJson.analysis || cleanResult
          actualConfidence = parsedJson.confidence || actualConfidence
          actualSources = parsedJson.sources || actualSources
          
        } catch (parseError) {
          console.log('Could not parse embedded JSON, using original result')
          // If parsing fails, clean up the raw text
          cleanResult = cleanResult.replace(/```json/g, '').replace(/```/g, '').replace(/^\s*{\s*"result":\s*"/g, '').replace(/",?\s*"confidence".*$/g, '')
        }
      }
      
      // Clean up any remaining quotes and formatting
      cleanResult = cleanResult.replace(/^["']|["']$/g, '').trim()
      
      let status: 'correct' | 'incorrect' | 'uncertain' = 'uncertain'
      let statusIcon = '❓'
      
      const resultText = cleanResult.toLowerCase()
      if (resultText.includes('incorrect') || resultText.includes('false') || resultText.includes('wrong') || resultText.includes('not correct')) {
        status = 'incorrect' 
        statusIcon = '❌'
      } else if (resultText.includes('correct') || resultText.includes('true') || resultText.includes('accurate') || resultText.includes('yes')) {
        status = 'correct'
        statusIcon = '✅'
      } else if (resultText.includes('uncertain') || resultText.includes('unclear') || resultText.includes('partially') || actualConfidence < 0.5) {
        status = 'uncertain'
        statusIcon = '❓'
      }
      
      const aiSource = actualSources && actualSources.length > 0 ? 
        (actualSources[0].includes('Gemini') ? 'Gemini AI' : 
         actualSources[0].includes('OpenAI') ? 'OpenAI' :
         actualSources[0].includes('Hugging') ? 'Hugging Face' : 'AI') : 'AI'
      
      const confidencePercentage = Math.round(actualConfidence * 100)
      const confidenceBar = '█'.repeat(Math.floor(confidencePercentage / 10)) + '░'.repeat(10 - Math.floor(confidencePercentage / 10))
      
      const formattedText = `${statusIcon} AI FACT CHECK - ${status.toUpperCase()}

📝 Selected Text:
"${selectedText}"

🔍 Analysis:
${cleanResult}

📊 Confidence: ${confidencePercentage}%
${confidenceBar} ${confidencePercentage}%

🤖 Powered by: ${aiSource}

${actualSources && actualSources.length > 0 ? `📚 Sources:\n${actualSources.map(source => `• ${source}`).join('\n')}` : ''}`
      
      addComment({
        id: Date.now().toString(),
        text: formattedText,
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
      console.error('Fact check error:', error)
      
      const errorText = `⚠️ AI FACT CHECK ERROR

❌ Fact check failed. Please make sure the backend server is running and try again.

📝 Selected text: "${selectedText}"`
      
      addComment({
        id: Date.now().toString(),
        text: errorText,
        author: 'AI',
        confidence: 0,
        sources: ['System Error'],
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
      
      <CommentSystem comments={comments} />
    </div>
  )
}