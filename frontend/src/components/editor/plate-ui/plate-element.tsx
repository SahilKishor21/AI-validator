import React, { ForwardedRef } from 'react'
import { SlateElement, SlateElementProps, TElement } from '@udecode/plate-common'
import { cn } from '../../../lib/utils'

export interface PlateElementPropsExtended<E extends TElement = TElement> extends SlateElementProps<E> {
  className?: string
  children: React.ReactNode
}

const PlateElementComponent = React.forwardRef<
  HTMLDivElement,
  PlateElementPropsExtended
>(
  ({ className, children, ...props }: PlateElementPropsExtended, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <SlateElement
        ref={ref}
        className={cn(
          'relative',
          className
        )}
        {...props}
      >
        {children}
      </SlateElement>
    )
  }
)

PlateElementComponent.displayName = 'PlateElement'
export { PlateElementComponent }