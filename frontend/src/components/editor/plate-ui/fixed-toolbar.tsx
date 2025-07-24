import { ToolbarButton } from '@udecode/plate-toolbar'
import { useReadOnly } from 'slate-react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Quote,
  List,
  ListOrdered
} from 'lucide-react'
import { Separator } from '../../ui/separator'
import { cn } from '../../../lib/utils'

export interface FixedToolbarProps {
  className?: string
}

export const FixedToolbar = ({ className }: FixedToolbarProps) => {
  const readOnly = useReadOnly()

  if (readOnly) return null

  return (
    <div className={cn(
      'sticky top-0 z-50 flex items-center gap-1 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2',
      className
    )}>
      <ToolbarButton
        tooltip={{ content: "Bold (⌘+B)" }}
        nodeType="bold"
        icon={<Bold className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Italic (⌘+I)" }}
        nodeType="italic"
        icon={<Italic className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Underline (⌘+U)" }}
        nodeType="underline"
        icon={<Underline className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Strikethrough" }}
        nodeType="strikethrough"
        icon={<Strikethrough className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Code (⌘+E)" }}
        nodeType="code"
        icon={<Code className="h-4 w-4" />}
      />

      <Separator orientation="vertical" className="h-6" />

      <ToolbarButton
        tooltip={{ content: "Heading 1" }}
        nodeType="h1"
        icon={<Heading1 className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Heading 2" }}
        nodeType="h2"
        icon={<Heading2 className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Heading 3" }}
        nodeType="h3"
        icon={<Heading3 className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Quote (⌘+Shift+.)" }}
        nodeType="blockquote"
        icon={<Quote className="h-4 w-4" />}
      />

      <ToolbarButton
        tooltip={{ content: "Bulleted list" }}
        nodeType="ul"
        icon={<List className="h-4 w-4" />}
      />

            <ToolbarButton
              tooltip={{ content: "Numbered list" }}
              nodeType="ol"
              icon={<ListOrdered className="h-4 w-4" />}
            />
          </div>
        )
      }
