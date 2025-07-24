import React from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '../../../lib/utils'

const DragHandle = () => (
  <div className="flex h-4 w-4 cursor-grab items-center justify-center opacity-60 hover:opacity-100">
    <GripVertical className="h-3 w-3" />
  </div>
)

// Updated component that works with current Plate.js approach
export const BlockDraggable = ({ children, element, ...props }: any) => {
  const isDraggable = ['paragraph', 'heading-one', 'heading-two', 'heading-three', 'block-quote'].includes(element?.type)
  
  if (!isDraggable) {
    return <div {...props}>{children}</div>
  }

  return (
    <div
      className={cn(
        'group relative',
        'hover:bg-muted/50 rounded-sm transition-colors'
      )}
      {...props}
    >
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DragHandle />
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

// Alternative approach: Create a higher-order component that mimics the old withDraggables behavior
export const withDraggables = (components: any) => {
  return {
    ...components,
    // Map the element types to draggable versions
    p: ({ children, element, ...props }: any) => (
      <BlockDraggable element={element} {...props}>
        {components.p ? React.createElement(components.p, { children, element, ...props }) : children}
      </BlockDraggable>
    ),
    h1: ({ children, element, ...props }: any) => (
      <BlockDraggable element={element} {...props}>
        {components.h1 ? React.createElement(components.h1, { children, element, ...props }) : children}
      </BlockDraggable>
    ),
    h2: ({ children, element, ...props }: any) => (
      <BlockDraggable element={element} {...props}>
        {components.h2 ? React.createElement(components.h2, { children, element, ...props }) : children}
      </BlockDraggable>
    ),
    h3: ({ children, element, ...props }: any) => (
      <BlockDraggable element={element} {...props}>
        {components.h3 ? React.createElement(components.h3, { children, element, ...props }) : children}
      </BlockDraggable>
    ),
    blockquote: ({ children, element, ...props }: any) => (
      <BlockDraggable element={element} {...props}>
        {components.blockquote ? React.createElement(components.blockquote, { children, element, ...props }) : children}
      </BlockDraggable>
    ),
  }
}