/**
 * 分隔线节点，对齐 Tiptap `HorizontalRule`（`@tiptap/extension-horizontal-rule`）。
 *
 * 不 import `@tiptap/*`，也不操作 ProseMirror transaction。这里只保留那条节点对外可观察的约定：
 * 块级 `hr`、`setHorizontalRule` 之后光标落在规则后、文末没有节点时补 `nextNodeType`、
 * 行首 `---` / `—-` / `___ ` / `*** ` 变成节点。真正的编辑器仍由宿主执行
 * `commands.setHorizontalRule()`，见 `tiptapEditorHost`。
 */

import { blockPlain, isTextblockType, nodeAt, spliceChildren, textblock } from './tree.ts'
import type { OjDocument, OjNode } from './tree.ts'

export const HORIZONTAL_RULE_NAME = 'horizontalRule'
export const HORIZONTAL_RULE_GROUP = 'block'
/** Markdown 词法名。渲染结果是 `---`。 */
export const HORIZONTAL_RULE_MARKDOWN_TOKEN = 'hr'
export const HORIZONTAL_RULE_MARKDOWN = '---'

/**
 * 与 Tiptap `nodeInputRule` 的 `find` 相同。
 * 第二支是 U+2014 EM DASH 再加一个连字符。
 */
export const HORIZONTAL_RULE_INPUT: RegExp = /^(?:---|[\u2014]-|___\s|\*\*\*\s)$/

export interface HorizontalRuleOptions {
  HTMLAttributes: Readonly<Record<string, string>>
  /** 规则插在文末时补上的文本块。未知名字退回段落。 */
  nextNodeType: string
}

export interface OjHorizontalRule {
  type: 'horizontalRule'
  htmlAttributes: Readonly<Record<string, string>>
}

const DEFAULT_OPTIONS: HorizontalRuleOptions = {
  HTMLAttributes: {},
  nextNodeType: 'paragraph',
}

export function horizontalRuleOptions(partial?: Partial<HorizontalRuleOptions>): HorizontalRuleOptions {
  return {
    HTMLAttributes: partial?.HTMLAttributes ?? DEFAULT_OPTIONS.HTMLAttributes,
    nextNodeType: partial?.nextNodeType && partial.nextNodeType.length > 0 ? partial.nextNodeType : DEFAULT_OPTIONS.nextNodeType,
  }
}

export function isHorizontalRuleInput(text: string): boolean {
  return HORIZONTAL_RULE_INPUT.test(text)
}

const ATTR_NAME = /^[A-Za-z_:][\w:.-]*$/

function safeName(name: string): boolean {
  return ATTR_NAME.test(name) && !/^on/i.test(name)
}

/** 后者覆盖前者。事件处理属性名会被丢掉。 */
export function mergeAttributes(
  ...sources: readonly (Readonly<Record<string, string>> | undefined)[]
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const source of sources) {
    if (!source) continue
    for (const [key, value] of Object.entries(source)) {
      if (!safeName(key)) continue
      out[key] = value
    }
  }
  return out
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function readAttributes(source: string): Record<string, string> | null {
  const attrs: Record<string, string> = {}
  const re = /([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let matched = 0
  for (const match of source.matchAll(re)) {
    matched += match[0].length
    const name = match[1]
    if (!name || !safeName(name)) continue
    attrs[name] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  const leftovers = source.replace(/\s/g, '')
  if (matched !== leftovers.length && source.trim().length > 0) {
    const stripped = source.replace(re, '').trim()
    if (stripped.length > 0) return null
  }
  return attrs
}

/** `parseHTML: [{ tag: 'hr' }]`。只接受单独一个 hr 标签。 */
export function parseHorizontalRuleHTML(html: string): OjHorizontalRule | null {
  const match = /^<hr\b([^>]*)>$/i.exec(html.trim())
  if (!match) return null
  let raw = (match[1] ?? '').trim()
  if (raw.endsWith('/')) raw = raw.slice(0, -1).trim()
  const htmlAttributes = readAttributes(raw)
  if (!htmlAttributes) return null
  return { type: 'horizontalRule', htmlAttributes }
}

/** `renderHTML`：选项上的 HTMLAttributes 打底，节点自己的属性覆盖。 */
export function renderHorizontalRule(node: OjHorizontalRule, options?: Partial<HorizontalRuleOptions>): string {
  const attrs = mergeAttributes(horizontalRuleOptions(options).HTMLAttributes, node.htmlAttributes)
  const body = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(' ')
  return body.length === 0 ? '<hr>' : `<hr ${body}>`
}

export function renderHorizontalRuleMarkdown(): string {
  return HORIZONTAL_RULE_MARKDOWN
}

export function parseHorizontalRuleMarkdown(token: string): boolean {
  return token === HORIZONTAL_RULE_MARKDOWN_TOKEN
}

function ruleNode(options: HorizontalRuleOptions): OjNode {
  const attrs = mergeAttributes(options.HTMLAttributes)
  return Object.keys(attrs).length > 0 ? { type: 'horizontalRule', attrs } : { type: 'horizontalRule' }
}

function nextTextblock(typeName: string): OjNode {
  if (typeName === 'heading') return textblock('heading', '', { level: 1 })
  return textblock('paragraph', '')
}

function finish(root: OjNode, parentPath: readonly number[], hrIndex: number, options: HorizontalRuleOptions): OjDocument {
  const parent = parentPath.length === 0 ? root : nodeAt(root, parentPath)
  const content = parent?.content ?? []
  const next = content[hrIndex + 1]
  if (next && isTextblockType(next.type)) {
    return { doc: root, selection: { kind: 'text', path: [...parentPath, hrIndex + 1], offset: 0 } }
  }
  if (next) return { doc: root, selection: { kind: 'node', path: [...parentPath, hrIndex + 1], offset: 0 } }
  const appended = spliceChildren(root, parentPath, content.length, 0, [nextTextblock(options.nextNodeType)])
  return { doc: appended, selection: { kind: 'text', path: [...parentPath, content.length], offset: 0 } }
}

/**
 * `setHorizontalRule()`。
 * 文本光标把当前文本块拆开，规则插在中间；节点选区则插在选中块之后。
 * 后面已有文本块时，光标进到那个块的开头；后面是别的块时改成节点选区；
 * 后面什么都没有时补 `nextNodeType`（默认段落）。
 */
export function setHorizontalRule(doc: OjDocument, options?: Partial<HorizontalRuleOptions>): OjDocument {
  const resolved = horizontalRuleOptions(options)
  const hr = ruleNode(resolved)
  const content = doc.doc.content ?? []
  if (content.length === 0) return finish(spliceChildren(doc.doc, [], 0, 0, [hr]), [], 0, resolved)

  const path = doc.selection.path
  const index = path[path.length - 1]
  const parentPath = path.slice(0, -1)
  if (index === undefined) return doc
  const parent = parentPath.length === 0 ? doc.doc : nodeAt(doc.doc, parentPath)
  const siblings = parent?.content ?? []
  const at = Math.min(siblings.length - 1, Math.max(0, index))
  const current = siblings[at]

  if (doc.selection.kind === 'node' || !current || !isTextblockType(current.type)) {
    const root = spliceChildren(doc.doc, parentPath, at + 1, 0, [hr])
    return finish(root, parentPath, at + 1, resolved)
  }

  const text = blockPlain(current)
  const offset = Math.min(text.length, Math.max(0, doc.selection.offset))
  const left = text.slice(0, offset)
  const right = text.slice(offset)
  const middle: OjNode[] = []
  if (left.length > 0) middle.push(textblock(current.type, left, current.attrs))
  const hrIndex = at + middle.length
  middle.push(hr)
  if (right.length > 0) middle.push(textblock(current.type, right, current.attrs))
  return finish(spliceChildren(doc.doc, parentPath, at, 1, middle), parentPath, hrIndex, resolved)
}

/**
 * 输入规则。光标在文本块末尾，且光标前的整段匹配 `HORIZONTAL_RULE_INPUT` 时，
 * 用分隔线换掉这一段，光标规则与 `setHorizontalRule` 相同。
 */
export function applyHorizontalRuleInput(doc: OjDocument, options?: Partial<HorizontalRuleOptions>): OjDocument | null {
  if (doc.selection.kind !== 'text') return null
  const path = doc.selection.path
  const current = nodeAt(doc.doc, path)
  if (!current || !isTextblockType(current.type)) return null
  const text = blockPlain(current)
  if (doc.selection.offset !== text.length || !isHorizontalRuleInput(text)) return null
  const index = path[path.length - 1]
  if (index === undefined) return null
  const resolved = horizontalRuleOptions(options)
  const parentPath = path.slice(0, -1)
  return finish(spliceChildren(doc.doc, parentPath, index, 1, [ruleNode(resolved)]), parentPath, index, resolved)
}
