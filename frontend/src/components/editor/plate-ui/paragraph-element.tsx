import React, { ForwardedRef } from 'react'
import { SlateElement, SlateElementProps } from '@udecode/plate-common'
import { cn } from '../../../lib/utils'

type ParagraphElementProps = SlateElementProps & {
  className?: string
  children?: React.ReactNode
}

export const ParagraphElement = React.forwardRef<HTMLDivElement, ParagraphElementProps>(
  ({ className, children, ...props }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <SlateElement
        ref={ref}
        className={cn('py-2', className)}
        {...props}
      >
        {children}
      </SlateElement>
    )
  }
)

ParagraphElement.displayName = 'ParagraphElement'