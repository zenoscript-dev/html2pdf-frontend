import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical"
import { $createHashtagNode } from "@lexical/hashtag"

// Custom hashtag node
class HashtagNode extends $createTextNode {
  static getType() {
    return 'hashtag'
  }

  static clone(node: HashtagNode) {
    return new HashtagNode(node.__text, node.__key)
  }

  createDOM() {
    const dom = document.createElement('span')
    dom.className = 'hashtag bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm font-medium'
    dom.textContent = this.__text
    return dom
  }

  updateDOM() {
    return false
  }
}

export function HashtagPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const text = selection.getTextContent()
            if (text.startsWith('#')) {
              // Convert to hashtag
              const hashtagText = text.trim()
              if (hashtagText.length > 1) {
                selection.removeText()
                const hashtagNode = new HashtagNode(hashtagText)
                selection.insertNodes([hashtagNode])
                selection.insertText(' ')
              }
            }
          }
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor])

  return null
}
