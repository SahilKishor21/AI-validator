import React from 'react'
import { cn } from '../../lib/utils'

export const SlateElement = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote 
          className={cn('border-l-4 border-primary pl-4 italic py-2')}
          {...attributes}
        >
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul className="list-disc list-inside py-2" {...attributes}>
          {children}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol className="list-decimal list-inside py-2" {...attributes}>
          {children}
        </ol>
      )
    case 'list-item':
      return (
        <li className="py-1" {...attributes}>
          {children}
        </li>
      )
    case 'heading':
      return (
        <h2 className="text-2xl font-bold py-2" {...attributes}>
          {children}
        </h2>
      )
    case 'code-block':
      return (
        <pre className="bg-muted p-4 rounded-md font-mono text-sm overflow-auto" {...attributes}>
          <code>{children}</code>
        </pre>
      )
    default:
      return (
        <p className="py-1" {...attributes}>
          {children}
        </p>
      )
  }
}