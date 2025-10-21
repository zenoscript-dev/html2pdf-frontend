import { useState, useRef, useCallback } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ToolbarPlugin } from "@/components/editor/editor-ui/toolbar"
import { DragDropPlugin } from "@/components/editor/editor-ui/drag-drop"
import { AutoEmbedPlugin } from "@/components/editor/editor-ui/auto-embed"
import { HashtagPlugin } from "@/components/editor/editor-ui/hashtag-plugin"
import { ContextMenuPlugin } from "@/components/editor/editor-ui/context-menu"

// Simple link matcher for AutoLinkPlugin
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text)
    if (match === null) {
      return null
    }
    const fullMatch = match[0]
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
    }
  },
  (text: string) => {
    const match = EMAIL_MATCHER.exec(text)
    if (match === null) {
      return null
    }
    const fullMatch = match[0]
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: `mailto:${fullMatch}`,
    }
  },
]

interface PluginsProps {
  readOnly?: boolean
}

export function Plugins({ readOnly = false }: PluginsProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }, [])

  // Stop event propagation for toolbar interactions
  const handleToolbarInteraction = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Toolbar - Only show if not readOnly */}
      {!readOnly && (
        <div onClick={handleToolbarInteraction}>
          <ToolbarPlugin />
        </div>
      )}
      
      {/* Editor Content */}
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="editor-container">
              <div className="editor-scroller">
                <div className="editor" ref={onRef}>
                  <ContentEditable 
                    placeholder={readOnly ? "" : "Start typing ..."} 
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        
        {/* Core Plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <HorizontalRulePlugin />
        
        {/* Advanced Plugins - Only enable if not readOnly */}
        {!readOnly && (
          <>
            <DragDropPlugin />
            <AutoEmbedPlugin />
            <HashtagPlugin />
            <ContextMenuPlugin />
          </>
        )}
      </div>
    </div>
  )
}