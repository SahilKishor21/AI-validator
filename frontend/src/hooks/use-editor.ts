import { useMemo } from 'react'
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { CustomEditor, CustomText } from '../lib/slate-types'

export const useSlateEditor = () => {
  const editor = useMemo(() => {
    const baseEditor = withHistory(withReact(createEditor()))
    
    const { normalizeNode } = baseEditor
    
    baseEditor.normalizeNode = ([node, path]) => {
      if (path.length === 0) {
        if (editor.children.length < 1) {
          const title = { type: 'paragraph' as const, children: [{ text: '' }] }
          Transforms.insertNodes(editor, title, { at: path.concat(0) })
        }
        
        for (const [child, childPath] of Array.from(Editor.nodes(editor, { at: path }))) {
          if (
            SlateElement.isElement(child) &&
            !editor.isInline(child) &&
            Editor.hasInlines(editor, child)
          ) {
            for (const [grandChild, grandChildPath] of Array.from(Editor.nodes(editor, { at: childPath }))) {
              if (typeof grandChild === 'string') {
                Transforms.wrapNodes(
                  editor,
                  { type: 'paragraph', children: [] } as SlateElement,
                  { at: grandChildPath }
                )
                return
              }
            }
          }
        }
      }
      
      return normalizeNode([node, path])
    }
    
    return baseEditor as CustomEditor
  }, [])
  
  return editor
}

export const toggleMark = (editor: CustomEditor, format: keyof CustomText) => {
  const isActive = isMarkActive(editor, format)
  
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const isMarkActive = (editor: CustomEditor, format: keyof CustomText) => {
  const marks = Editor.marks(editor) as Partial<CustomText> | null
  return marks ? (marks[format] === true) : false
}

export const toggleBlock = (editor: CustomEditor, format: string) => {
  const isActive = isBlockActive(editor, format)
  const isList = format === 'numbered-list' || format === 'bulleted-list'
  
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      typeof ((n as SlateElement & { type: string }).type) === 'string' &&
      ['numbered-list', 'bulleted-list'].includes((n as SlateElement & { type: string }).type),
    split: true,
  })
  
  const newType = isActive ? 'paragraph' : isList ? 'list-item' : format
  
  Transforms.setNodes<SlateElement>(editor, { type: newType } as any)
  
  if (!isActive && isList) {
    const block = { type: format as any, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

export const isBlockActive = (editor: CustomEditor, format: string) => {
  const { selection } = editor
  if (!selection) return false
  
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        'type' in n &&
        (n as SlateElement & { type: string }).type === format,
    })
  )
  
  return !!match
}