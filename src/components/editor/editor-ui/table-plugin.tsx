import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $createTableNode, $createTableCellNode, $createTableRowNode, $isTableNode } from "@lexical/table"
import { $createParagraphNode } from "lexical"
import { $findMatchingParent } from "@lexical/utils"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  Plus, 
  Trash2,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TablePlugin() {
  const [editor] = useLexicalComposerContext()

  const insertTable = (rows: number, columns: number) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const tableNode = $createTableNode()
        
        for (let i = 0; i < rows; i++) {
          const tableRowNode = $createTableRowNode()
          
          for (let j = 0; j < columns; j++) {
            const tableCellNode = $createTableCellNode(i === 0 ? 1 : 0) // 1 for header, 0 for data
            const paragraphNode = $createParagraphNode()
            tableCellNode.append(paragraphNode)
            tableRowNode.append(tableCellNode)
          }
          
          tableNode.append(tableRowNode)
        }
        
        selection.insertNodes([tableNode])
      }
    })
  }

  const addRow = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const tableNode = $findMatchingParent(selection.anchor.getNode(), $isTableNode)
        if (tableNode) {
          const newRow = $createTableRowNode()
          const firstRow = tableNode.getFirstChild()
          if (firstRow && firstRow.getType() === 'tablerow') {
            const cellCount = (firstRow as any).getChildren().length
            for (let i = 0; i < cellCount; i++) {
              const newCell = $createTableCellNode(0) // 0 for data cell
              const paragraph = $createParagraphNode()
              newCell.append(paragraph)
              newRow.append(newCell)
            }
            tableNode.append(newRow)
          }
        }
      }
    })
  }

  const addColumn = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const tableNode = $findMatchingParent(selection.anchor.getNode(), $isTableNode)
        if (tableNode) {
          const rows = (tableNode as any).getChildren()
          rows.forEach((row: any) => {
            const newCell = $createTableCellNode(0) // 0 for data cell
            const paragraph = $createParagraphNode()
            newCell.append(paragraph)
            row.append(newCell)
          })
        }
      }
    })
  }

  const deleteTable = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const tableNode = $findMatchingParent(selection.anchor.getNode(), $isTableNode)
        if (tableNode) {
          tableNode.remove()
        }
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Insert Table">
            <Table className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="p-2">
            <div className="text-sm font-medium mb-2">Insert Table</div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }, (_, i) => {
                const row = Math.floor(i / 5) + 1
                const col = (i % 5) + 1
                return (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertTable(row, col)}
                    title={`${row}x${col} table`}
                  >
                    <div className="w-4 h-4 border border-gray-300 grid grid-cols-3 gap-px">
                      {Array.from({ length: row * col }, (_, j) => (
                        <div key={j} className="bg-gray-200" />
                      ))}
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Table Options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={deleteTable}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
