import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, $getRoot } from "lexical"
import { $setBlocksType } from "@lexical/selection"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list"
import { $createCodeNode } from "@lexical/code"
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode"
import { TOGGLE_LINK_COMMAND } from "@lexical/link"
import { $isListNode } from "@lexical/list"
import { $isHeadingNode } from "@lexical/rich-text"
import { $isCodeNode } from "@lexical/code"
import { $isQuoteNode } from "@lexical/rich-text"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  Minus,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Trash2,
  Mic,
  MicOff,
  Type,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react"
import {
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical"
import { $createParagraphNode, $createTextNode } from "lexical"
import { $isLinkNode } from "@lexical/link"
import { EmojiPicker } from "./emoji-picker"
import { TablePlugin } from "./table-plugin"
import { FontSizePlugin } from "./font-size-plugin"
import { FontColorPlugin } from "./font-color-plugin"
import { AlignmentPlugin } from "./alignment-plugin"

const LowPriority = 1

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] = useState("paragraph")
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
        
        if (transcript) {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              selection.insertText(transcript)
            }
          })
        }
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [editor])

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
      setIsCode(selection.hasFormat("code"))
      setIsSubscript(selection.hasFormat("subscript"))
      setIsSuperscript(selection.hasFormat("superscript"))

      // Update links
      const node = selection.anchor.getNode()
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      // Update block type
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const type = element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : $isCodeNode(element)
            ? "code"
            : $isQuoteNode(element)
            ? "quote"
            : "paragraph"
          setBlockType(type)
        }
      }
      
      // Update character and word count
      const root = $getRoot()
      const textContent = root.getTextContent()
      setCharacterCount(textContent.length)
      setWordCount(textContent.trim() ? textContent.trim().split(/\s+/).length : 0)
    }
  }, [activeEditor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar()
        setActiveEditor(newEditor)
        return false
      },
      LowPriority
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return activeEditor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [activeEditor, updateToolbar])

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
    }
  }

  const formatHeading = (headingSize: string) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize as any))
        }
      })
    }
  }

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
  }

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    }
  }

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode())
        }
      })
    }
  }

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://")
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
  }

  const clearEditor = () => {
    editor.update(() => {
      const root = $getRoot()
      root.clear()
    })
  }

  const toggleSpeechRecognition = () => {
    if (!recognition) return
    
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }







  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      {/* History */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined)
          }}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined)
          }}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Type */}
      <Select
        value={blockType}
        onValueChange={(value) => {
          if (value === "paragraph") {
            formatParagraph()
          } else if (value.startsWith("h")) {
            formatHeading(value)
          } else if (value === "quote") {
            formatQuote()
          } else if (value === "code") {
            formatCode()
          }
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Normal</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
          <SelectItem value="h4">Heading 4</SelectItem>
          <SelectItem value="h5">Heading 5</SelectItem>
          <SelectItem value="h6">Heading 6</SelectItem>
          <SelectItem value="quote">Quote</SelectItem>
          <SelectItem value="code">Code Block</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={isBold ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
          }}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
          }}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={isUnderline ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant={isStrikethrough ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant={isCode ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
          }}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Subscript/Superscript */}
      <div className="flex items-center gap-1">
        <Button
          variant={isSubscript ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
          }}
          title="Subscript"
        >
          <Subscript className="h-4 w-4" />
        </Button>
        <Button
          variant={isSuperscript ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
          }}
          title="Superscript"
        >
          <Superscript className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant={blockType === "ul" ? "default" : "ghost"}
          size="sm"
          onClick={formatBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={blockType === "ol" ? "default" : "ghost"}
          size="sm"
          onClick={formatNumberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Other Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={isLink ? "default" : "ghost"}
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertHorizontalRule}
          title="Insert Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <TablePlugin />
        <FontSizePlugin />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Advanced Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant={isListening ? "default" : "ghost"}
          size="sm"
          onClick={toggleSpeechRecognition}
          title={isListening ? "Stop Speech Recognition" : "Start Speech Recognition"}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearEditor}
          title="Clear Editor"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <EmojiPicker />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <AlignmentPlugin />

      <Separator orientation="vertical" className="h-6" />

      {/* Font Color */}
      <FontColorPlugin />

      <Separator orientation="vertical" className="h-6" />

      {/* Text Indentation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* Add indent logic */}}
          title="Increase Indent"
        >
          <IndentIncrease className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* Add indent logic */}}
          title="Decrease Indent"
        >
          <IndentDecrease className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Character & Word Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Type className="h-4 w-4" />
        <span>{characterCount} chars</span>
        <span>•</span>
        <span>{wordCount} words</span>
      </div>

    </div>
  )
}

