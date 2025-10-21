import { useState, useCallback, useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Bold,
  Italic,
  Underline,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Code,
} from "lucide-react"

export function ContextMenuPlugin() {
  const [editor] = useLexicalComposerContext()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    visible: boolean
  }>({ x: 0, y: 0, visible: false })

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true
    })
  }, [])

  const handleClick = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
    }
  }, [handleContextMenu, handleClick])

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const copyText = () => {
    navigator.clipboard.writeText(window.getSelection()?.toString() || '')
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const cutText = () => {
    navigator.clipboard.writeText(window.getSelection()?.toString() || '')
    // Implementation for cutting text
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const pasteText = async () => {
    const text = await navigator.clipboard.readText()
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertText(text)
      }
    })
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const deleteText = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.removeText()
      }
    })
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  if (!contextMenu.visible) return null

  return (
    <div
      className="fixed z-50"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={copyText}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </ContextMenuItem>
          <ContextMenuItem onClick={cutText}>
            <Scissors className="h-4 w-4 mr-2" />
            Cut
          </ContextMenuItem>
          <ContextMenuItem onClick={pasteText}>
            <Clipboard className="h-4 w-4 mr-2" />
            Paste
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => formatText('bold')}>
            <Bold className="h-4 w-4 mr-2" />
            Bold
          </ContextMenuItem>
          <ContextMenuItem onClick={() => formatText('italic')}>
            <Italic className="h-4 w-4 mr-2" />
            Italic
          </ContextMenuItem>
          <ContextMenuItem onClick={() => formatText('underline')}>
            <Underline className="h-4 w-4 mr-2" />
            Underline
          </ContextMenuItem>
          <ContextMenuItem onClick={() => formatText('code')}>
            <Code className="h-4 w-4 mr-2" />
            Code
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={deleteText}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
