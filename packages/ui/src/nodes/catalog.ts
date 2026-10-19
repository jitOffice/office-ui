/**
 * 节点扩展目录。形状对齐 Tiptap 的 Node：
 * https://tiptap.dev/docs/editor/extensions/nodes
 *
 * 每个节点声明 name、group、content、parseHTML、命令名、快捷键和输入规则。
 * 这里不 import `@tiptap/*`。命令真正改文档的函数在 `document.ts`。
 */

import { HORIZONTAL_RULE_INPUT, HORIZONTAL_RULE_MARKDOWN, HORIZONTAL_RULE_MARKDOWN_TOKEN } from './horizontal-rule.ts'

export type OjNodeGroup = 'block' | 'inline'

export interface OjParseRule {
  tag: string
}

export interface OjNodeExtension {
  name: string
  group: OjNodeGroup
  /** 与 Tiptap schema 的 content 表达式相同，例如 `block+`、`inline*`。 */
  content: string
  atom?: boolean
  defining?: boolean
  parseHTML: readonly OjParseRule[]
  /** 渲染用的标签。标题按 level 在渲染时选择 h1–h6。 */
  renderTag: string
  commands: readonly string[]
  shortcuts: Readonly<Record<string, string>>
  /** 光标前文本需要整段匹配的输入规则。空正则表示这个节点没有输入规则。 */
  input?: RegExp
  markdownToken?: string
  markdown?: string
}

const none: Readonly<Record<string, string>> = {}

export const documentNode: OjNodeExtension = {
  name: 'doc',
  group: 'block',
  content: 'block+',
  parseHTML: [],
  renderTag: 'div',
  commands: [],
  shortcuts: none,
}

export const paragraphNode: OjNodeExtension = {
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: [{ tag: 'p' }],
  renderTag: 'p',
  commands: ['setParagraph'],
  shortcuts: none,
}

export const textNode: OjNodeExtension = {
  name: 'text',
  group: 'inline',
  content: '',
  parseHTML: [],
  renderTag: '',
  commands: [],
  shortcuts: none,
}

export const headingNode: OjNodeExtension = {
  name: 'heading',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML: [{ tag: 'h1' }, { tag: 'h2' }, { tag: 'h3' }, { tag: 'h4' }, { tag: 'h5' }, { tag: 'h6' }],
  renderTag: 'h1',
  commands: ['setHeading', 'toggleHeading'],
  shortcuts: {
    'Mod-Alt-1': 'toggleHeading',
    'Mod-Alt-2': 'toggleHeading',
    'Mod-Alt-3': 'toggleHeading',
    'Mod-Alt-4': 'toggleHeading',
    'Mod-Alt-5': 'toggleHeading',
    'Mod-Alt-6': 'toggleHeading',
  },
  input: /^(#{1,6})\s$/,
}

export const blockquoteNode: OjNodeExtension = {
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML: [{ tag: 'blockquote' }],
  renderTag: 'blockquote',
  commands: ['setBlockquote', 'toggleBlockquote', 'unsetBlockquote'],
  shortcuts: { 'Mod-Shift-b': 'toggleBlockquote' },
  input: /^\s*>\s$/,
}

export const bulletListNode: OjNodeExtension = {
  name: 'bulletList',
  group: 'block',
  content: 'listItem+',
  parseHTML: [{ tag: 'ul' }],
  renderTag: 'ul',
  commands: ['toggleBulletList'],
  shortcuts: { 'Mod-Shift-8': 'toggleBulletList' },
  input: /^\s*[-+*]\s$/,
}

export const orderedListNode: OjNodeExtension = {
  name: 'orderedList',
  group: 'block',
  content: 'listItem+',
  parseHTML: [{ tag: 'ol' }],
  renderTag: 'ol',
  commands: ['toggleOrderedList'],
  shortcuts: { 'Mod-Shift-7': 'toggleOrderedList' },
  input: /^(\d+)\.\s$/,
}

export const listItemNode: OjNodeExtension = {
  name: 'listItem',
  group: 'block',
  content: 'paragraph block*',
  defining: true,
  parseHTML: [{ tag: 'li' }],
  renderTag: 'li',
  commands: [],
  shortcuts: none,
}

export const codeBlockNode: OjNodeExtension = {
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  defining: true,
  parseHTML: [{ tag: 'pre' }],
  renderTag: 'pre',
  commands: ['setCodeBlock', 'toggleCodeBlock'],
  shortcuts: { 'Mod-Alt-c': 'toggleCodeBlock' },
  input: /^```([a-z]+)?[\s\n]$/,
}

export const hardBreakNode: OjNodeExtension = {
  name: 'hardBreak',
  group: 'inline',
  content: '',
  atom: true,
  parseHTML: [{ tag: 'br' }],
  renderTag: 'br',
  commands: ['setHardBreak'],
  shortcuts: { 'Shift-Enter': 'setHardBreak', 'Mod-Enter': 'setHardBreak' },
}

export const horizontalRuleNode: OjNodeExtension = {
  name: 'horizontalRule',
  group: 'block',
  content: '',
  atom: true,
  parseHTML: [{ tag: 'hr' }],
  renderTag: 'hr',
  commands: ['setHorizontalRule'],
  shortcuts: none,
  input: HORIZONTAL_RULE_INPUT,
  markdownToken: HORIZONTAL_RULE_MARKDOWN_TOKEN,
  markdown: HORIZONTAL_RULE_MARKDOWN,
}

export const imageNode: OjNodeExtension = {
  name: 'image',
  group: 'block',
  content: '',
  atom: true,
  parseHTML: [{ tag: 'img' }],
  renderTag: 'img',
  commands: ['setImage'],
  shortcuts: none,
}

/** 与 Tiptap StarterKit 的节点集合对应，另加 image。 */
export const starterNodes: readonly OjNodeExtension[] = [
  documentNode,
  paragraphNode,
  textNode,
  headingNode,
  blockquoteNode,
  bulletListNode,
  orderedListNode,
  listItemNode,
  codeBlockNode,
  hardBreakNode,
  horizontalRuleNode,
  imageNode,
]

export function nodeExtension(name: string): OjNodeExtension | undefined {
  return starterNodes.find((node) => node.name === name)
}

export interface OjInputMatch {
  node: string
  consume: number
  level?: number
  language?: string
}

/** 把光标前的文本交给各节点的 input。先匹配的规则生效。 */
export function matchNodeInput(before: string): OjInputMatch | null {
  const heading = headingNode.input?.exec(before)
  const marks = heading?.[1]
  if (heading && marks) return { node: 'heading', consume: before.length, level: marks.length }
  if (blockquoteNode.input?.test(before)) return { node: 'blockquote', consume: before.length }
  if (bulletListNode.input?.test(before)) return { node: 'bulletList', consume: before.length }
  if (orderedListNode.input?.test(before)) return { node: 'orderedList', consume: before.length }
  if (codeBlockNode.input?.test(before)) return { node: 'codeBlock', consume: before.length }
  if (horizontalRuleNode.input?.test(before)) return { node: 'horizontalRule', consume: before.length }
  return null
}
