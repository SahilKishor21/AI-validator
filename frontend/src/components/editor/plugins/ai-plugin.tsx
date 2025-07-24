import React from 'react'
import { useEditorStore } from '../../../store/editor-store'
import { Button } from '../../ui/button'
import { Loader2, Brain } from 'lucide-react'

interface AIPluginProps {
  nodeId: string
  selectedText: string
}

export const AIPlugin: React.FC<AIPluginProps> = ({ nodeId, selectedText }) => {
  const { performFactCheck, isFactChecking } = useEditorStore()

  const handleFactCheck = async () => {
    if (!selectedText.trim()) return
    await performFactCheck(selectedText, nodeId)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleFactCheck}
      disabled={isFactChecking || !selectedText.trim()}
      className="flex items-center gap-2"
    >
      {isFactChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      Fact Check
    </Button>
  )
}