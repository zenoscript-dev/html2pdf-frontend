import { JSX, useEffect, useRef } from "react"
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable"

type Props = {
  placeholder: string
  className?: string
  placeholderClassName?: string
}

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const applyStyles = () => {
      if (editorRef.current) {
        const editor = editorRef.current
        
        // Apply base styles
        editor.style.lineHeight = '1.2'
        editor.style.fontSize = '14px'
        
        // Apply styles to all elements
        const allElements = editor.querySelectorAll('*')
        allElements.forEach(element => {
          const el = element as HTMLElement
          
          if (el.tagName === 'P') {
            el.style.margin = '0.2em 0'
            el.style.lineHeight = '1.2'
            el.style.padding = '0'
          } else if (el.tagName.match(/^H[1-6]$/)) {
            el.style.margin = '0.4em 0 0.2em 0'
            el.style.lineHeight = '1.2'
            el.style.padding = '0'
          } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            el.style.margin = '0.2em 0'
            el.style.paddingLeft = '1.2em'
            el.style.lineHeight = '1.2'
          } else if (el.tagName === 'LI') {
            el.style.margin = '0.1em 0'
            el.style.lineHeight = '1.2'
            el.style.padding = '0'
          } else if (el.tagName === 'DIV') {
            el.style.margin = '0'
            el.style.padding = '0'
            el.style.lineHeight = '1.2'
          }
        })
      }
    }

    // Apply styles immediately and on changes
    applyStyles()
    
    // Set up mutation observer to apply styles when content changes
    const observer = new MutationObserver(applyStyles)
    if (editorRef.current) {
      observer.observe(editorRef.current, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <LexicalContentEditable
      ref={editorRef}
      className={
        className ??
        `ContentEditable__root relative block h-[400px] overflow-auto px-8 py-4 focus:outline-none`
      }
      style={{
        lineHeight: '1.2',
        fontSize: '14px'
      }}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-8 py-[18px] text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  )
}
