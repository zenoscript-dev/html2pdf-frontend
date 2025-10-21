"use client"

import {
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import type {
  InitialConfigType,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import type { EditorState, SerializedEditorState } from "lexical"
import { useEffect, useState } from "react"
import { $getRoot } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  readOnly = false,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  readOnly?: boolean
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent toolbar clicks from propagating
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!isMounted) {
    return (
      <div className="bg-background overflow-hidden rounded-lg border shadow min-h-[200px] p-4">
        Loading editor...
      </div>
    )
  }

  return (
    <div 
      className="bg-background overflow-hidden rounded-lg border shadow"
      onClick={handleToolbarClick}
    >
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editable: !readOnly,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState && !editorState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <div onClick={handleToolbarClick}>
            <Plugins readOnly={readOnly} />
          </div>

          {!readOnly && (
            <OnChangePlugin
              ignoreSelectionChange={true}
              onChange={(editorState) => {
                // ALWAYS update editor state regardless of type  
                onChange?.(editorState)
                
                // FIX: Allow triggered updates during typing/edit mode but check content validity
                editorState.read(() => {
                  try {
                    const root = $getRoot()
                    const textContent = root.getTextContent()
                    const serialized = editorState.toJSON()
                    
                    // More permissive: always trigger but allow parent to filter useful content
                    onSerializedChange?.(serialized)
                  } catch (error) {
                    console.warn('Editor onChange error:', error)
                  }
                })
              }}
            />
          )}
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}