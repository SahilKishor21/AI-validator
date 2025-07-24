import {
  TElement,
  TText,
  TDescendant,
} from '@udecode/plate-common'

export interface CommentValue {
  id: string
  text: string
  author: string
  createdAt: string
  isResolved: boolean
  aiFactCheck?: {
    result: string
    confidence: number
    sources?: string[]
  }
}

export interface PlateElement extends TElement {
  id: string
  type: string
  children: TDescendant[]
  comments?: CommentValue[]
}

/// <reference types="vite/client" />

export interface PlateText extends TText {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export type PlateValue = PlateElement[]

export const ELEMENT_PARAGRAPH = 'p'
export const ELEMENT_H1 = 'h1'
export const ELEMENT_H2 = 'h2'
export const ELEMENT_H3 = 'h3'
export const ELEMENT_BLOCKQUOTE = 'blockquote'
export const ELEMENT_CODE_BLOCK = 'code_block'
export const ELEMENT_UL = 'ul'
export const ELEMENT_OL = 'ol'
export const ELEMENT_LI = 'li'

export const MARK_BOLD = 'bold'
export const MARK_ITALIC = 'italic'
export const MARK_UNDERLINE = 'underline'
export const MARK_STRIKETHROUGH = 'strikethrough'
export const MARK_CODE = 'code'

export const initialValue: PlateValue = [
  {
    id: '1',
    type: ELEMENT_PARAGRAPH,
    children: [{ text: 'Start writing your content here...' }],
  },
]