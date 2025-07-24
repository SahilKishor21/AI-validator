import React from 'react'
import { SlateLeaf, SlateLeafProps } from '@udecode/plate-common'
import { TText } from '@udecode/slate'
import { cn } from '../../../lib/utils'

export interface PlateLeafPropsExtended<V extends TText = TText> extends SlateLeafProps<V> {
  className?: string
  children: React.ReactNode
}

export const PlateLeafComponent = React.forwardRef<
  HTMLSpanElement,
  PlateLeafPropsExtended
>(
  ({ className, children, ...props }: PlateLeafPropsExtended, ref: React.ForwardedRef<HTMLSpanElement>) => {
    return (
      <SlateLeaf
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </SlateLeaf>
    )
  }
)

PlateLeafComponent.displayName = 'PlateLeaf'