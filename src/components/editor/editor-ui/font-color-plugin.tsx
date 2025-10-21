import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $patchStyleText } from "@lexical/selection"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Palette } from "lucide-react"

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Brown", value: "#A16207" },
]

export function FontColorPlugin() {
  const [editor] = useLexicalComposerContext()

  const applyColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // Use $patchStyleText for proper Lexical color application
        $patchStyleText(selection, {
          'color': color
        })
      }
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="Text Color">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color) => (
            <Button
              key={color.value}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{ backgroundColor: color.value }}
              onClick={() => applyColor(color.value)}
              title={color.name}
            >
              <span className="sr-only">{color.name}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
