import { useCallback, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection } from "lexical"
import { $createTextNode } from "lexical"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DragDropPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        files.forEach((file, index) => {
          if (index > 0) {
            selection.insertText('\n')
          }
          
          if (file.type.startsWith('image/')) {
            // Create image element
            const img = document.createElement('img')
            img.src = URL.createObjectURL(file)
            img.alt = file.name
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            
            // Insert image as HTML
            selection.insertRawText(`<img src="${img.src}" alt="${file.name}" style="max-width: 100%; height: auto;" />`)
          } else {
            // Insert file as text
            selection.insertText(`📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
          }
        })
      }
    })
  }, [editor])

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div
      className={`relative ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-blue-600 font-medium">Drop files here</p>
          </div>
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="absolute top-2 right-2 bg-white border rounded-lg shadow-lg p-2 max-w-xs z-20">
          <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
          <div className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
