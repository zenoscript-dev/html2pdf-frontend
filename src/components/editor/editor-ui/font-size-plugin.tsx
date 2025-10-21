import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $patchStyleText } from "@lexical/selection"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FONT_SIZES = [
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "28px", label: "28px" },
  { value: "32px", label: "32px" },
  { value: "36px", label: "36px" },
  { value: "48px", label: "48px" },
]

export function FontSizePlugin() {
  const [editor] = useLexicalComposerContext()
  const [currentFontSize, setCurrentFontSize] = useState("14px")

  const applyFontSize = (fontSize: string) => {
    setCurrentFontSize(fontSize)
    editor.update(() => {
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': fontSize
        })
      }
    })
  }

  return (
    <Select value={currentFontSize} onValueChange={applyFontSize}>
      <SelectTrigger className="w-20">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent>
        {FONT_SIZES.map((size) => (
          <SelectItem key={size.value} value={size.value}>
            {size.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
