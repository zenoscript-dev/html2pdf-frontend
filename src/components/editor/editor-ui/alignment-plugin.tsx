import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { FORMAT_ELEMENT_COMMAND, $getSelection, $isRangeSelection } from "lexical"
import { Button } from "@/components/ui/button"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { useState, useEffect } from "react"

export function AlignmentPlugin() {
  const [editor] = useLexicalComposerContext()
  const [currentAlignment, setCurrentAlignment] = useState<string>("left")

  const applyAlignment = (alignment: string) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)
    setCurrentAlignment(alignment)
  }

  // Update alignment state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          // Check current alignment of the selected element
          const anchorNode = selection.anchor.getNode()
          const element = anchorNode.getParent()
          if (element) {
            const style = element.getStyle()
            if (style) {
              const alignMatch = style.match(/text-align:\s*([^;]+)/)
              if (alignMatch) {
                setCurrentAlignment(alignMatch[1])
              } else {
                setCurrentAlignment("left")
              }
            }
          }
        }
      })
    })
  }, [editor])

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={currentAlignment === "left" ? "default" : "ghost"}
        size="sm"
        onClick={() => applyAlignment("left")}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant={currentAlignment === "center" ? "default" : "ghost"}
        size="sm"
        onClick={() => applyAlignment("center")}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant={currentAlignment === "right" ? "default" : "ghost"}
        size="sm"
        onClick={() => applyAlignment("right")}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant={currentAlignment === "justify" ? "default" : "ghost"}
        size="sm"
        onClick={() => applyAlignment("justify")}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  )
}
