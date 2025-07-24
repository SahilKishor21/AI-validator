import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export type HeadingElement = {
  type: 'heading'
  level: number
  children: CustomText[]
}

export type BlockQuoteElement = {
  type: 'block-quote'
  children: CustomText[]
}

export type CodeBlockElement = {
  type: 'code-block'
  children: CustomText[]
}

export type ListElement = {
  type: 'bulleted-list' | 'numbered-list'
  children: ListItemElement[]
}

export type ListItemElement = {
  type: 'list-item'
  children: CustomText[]
}

export type CustomElement = 
  | ParagraphElement 
  | HeadingElement 
  | BlockQuoteElement 
  | CodeBlockElement
  | ListElement
  | ListItemElement

export type FormattedText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export type CustomText = FormattedText

export type CustomDescendant = CustomElement | CustomText;

export const initialValue: CustomDescendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your content here...' }],
  },
]