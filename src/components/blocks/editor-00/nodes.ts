import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table"
import {
  ParagraphNode,
  TextNode,
} from "lexical"
import type {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
} from "lexical"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  TableNode,
  TableCellNode,
  TableRowNode,
]
