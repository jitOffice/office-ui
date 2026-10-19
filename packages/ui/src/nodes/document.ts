/**
 * 节点命令。名字与 Tiptap 的 `editor.commands.*` 相同，作用在 {@link OjDocument} 上。
 * 接到真正的 Tiptap 时不要再调用这些函数，命令桥会把 id 交给编辑器自己的实现。
 */

import { matchNodeInput } from './catalog.ts'
import { applyHorizontalRuleInput } from './horizontal-rule.ts'
import { blockPlain, isTextblockType, nodeAt, spliceChildren, textblock } from './tree.ts'
import type { OjDocument, OjNode, OjSelection } from './tree.ts'

function selected(doc: OjDocument): { path: readonly number[]; node: OjNode } | null {
  const node = nodeAt(doc.doc, doc.selection.path)
  if (!node) return null
  return { path: doc.selection.path, node }
}

function replaceAt(doc: OjDocument, path: readonly number[], node: OjNode, selection: OjSelection): OjDocument {
  const index = path[path.length - 1]
  if (index === undefined) return doc
  return { doc: spliceChildren(doc.doc, path.slice(0, -1), index, 1, [node]), selection }
}

export function toggleHeading(doc: OjDocument, level: number): OjDocument {
  const hit = selected(doc)
  if (!hit || !isTextblockType(hit.node.type)) return doc
  const safe = level >= 1 && level <= 6 ? level : 1
  const same = hit.node.type === 'heading' && hit.node.attrs?.level === safe
  const next = same ? textblock('paragraph', blockPlain(hit.node)) : textblock('heading', blockPlain(hit.node), { level: safe })
  const offset = Math.min(doc.selection.offset, blockPlain(next).length)
  return replaceAt(doc, hit.path, next, { kind: 'text', path: hit.path, offset })
}

export function toggleCodeBlock(doc: OjDocument): OjDocument {
  const hit = selected(doc)
  if (!hit || !isTextblockType(hit.node.type)) return doc
  const next = textblock(hit.node.type === 'codeBlock' ? 'paragraph' : 'codeBlock', blockPlain(hit.node))
  const offset = Math.min(doc.selection.offset, blockPlain(next).length)
  return replaceAt(doc, hit.path, next, { kind: 'text', path: hit.path, offset })
}

function ancestor(doc: OjDocument, type: string): { path: number[]; node: OjNode } | null {
  let current = doc.doc
  const acc: number[] = []
  let found: { path: number[]; node: OjNode } | null = null
  for (const index of doc.selection.path) {
    const child = current.content?.[index]
    if (!child) return found
    acc.push(index)
    if (child.type === type && acc.length < doc.selection.path.length) found = { path: [...acc], node: child }
    current = child
  }
  return found
}

function lift(doc: OjDocument, path: readonly number[]): OjDocument {
  const node = nodeAt(doc.doc, path)
  const index = path[path.length - 1]
  if (!node || index === undefined) return doc
  const isList = node.type === 'bulletList' || node.type === 'orderedList'
  const pieces = isList
    ? (node.content ?? []).flatMap((item) => [...(item.content ?? [])])
    : [...(node.content ?? [])]
  const root = spliceChildren(doc.doc, path.slice(0, -1), index, 1, pieces)
  const relative = doc.selection.path.slice(path.length)
  let flat = relative[0] ?? 0
  let tail = relative.slice(1)
  if (isList) {
    const itemIndex = relative[0] ?? 0
    flat = 0
    for (let item = 0; item < itemIndex; item += 1) flat += node.content?.[item]?.content?.length ?? 0
    const inside = relative.slice(1)
    flat += inside[0] ?? 0
    tail = inside.slice(1)
  }
  return {
    doc: root,
    selection: { kind: 'text', path: [...path.slice(0, -1), index + flat, ...tail], offset: doc.selection.offset },
  }
}

function wrap(doc: OjDocument, path: readonly number[], make: (node: OjNode) => OjNode, depth: number): OjDocument {
  const node = nodeAt(doc.doc, path)
  const index = path[path.length - 1]
  if (!node || index === undefined) return doc
  const root = spliceChildren(doc.doc, path.slice(0, -1), index, 1, [make(node)])
  const nested = Array.from({ length: depth }, () => 0)
  return { doc: root, selection: { kind: 'text', path: [...path, ...nested], offset: doc.selection.offset } }
}

export function toggleBlockquote(doc: OjDocument): OjDocument {
  const quote = ancestor(doc, 'blockquote')
  if (quote) return lift(doc, quote.path)
  const hit = selected(doc)
  if (!hit) return doc
  return wrap(doc, hit.path, (node) => ({ type: 'blockquote', content: [node] }), 1)
}

function toggleList(doc: OjDocument, type: 'bulletList' | 'orderedList'): OjDocument {
  const list = ancestor(doc, 'bulletList') ?? ancestor(doc, 'orderedList')
  if (list) {
    if (list.node.type === type) return lift(doc, list.path)
    return replaceAt(doc, list.path, { ...list.node, type }, doc.selection)
  }
  const hit = selected(doc)
  if (!hit || !isTextblockType(hit.node.type)) return doc
  return wrap(doc, hit.path, (node) => ({ type, content: [{ type: 'listItem', content: [node] }] }), 2)
}

export function toggleBulletList(doc: OjDocument): OjDocument {
  return toggleList(doc, 'bulletList')
}

export function toggleOrderedList(doc: OjDocument): OjDocument {
  return toggleList(doc, 'orderedList')
}

export function setHardBreak(doc: OjDocument): OjDocument {
  const hit = selected(doc)
  if (!hit || doc.selection.kind !== 'text' || !isTextblockType(hit.node.type)) return doc
  const text = blockPlain(hit.node)
  const offset = Math.min(text.length, Math.max(0, doc.selection.offset))
  const content: OjNode[] = []
  const left = text.slice(0, offset)
  const right = text.slice(offset)
  if (left.length > 0) content.push({ type: 'text', text: left })
  content.push({ type: 'hardBreak' })
  if (right.length > 0) content.push({ type: 'text', text: right })
  const next: OjNode = hit.node.attrs ? { type: hit.node.type, attrs: hit.node.attrs, content } : { type: hit.node.type, content }
  return replaceAt(doc, hit.path, next, { kind: 'text', path: hit.path, offset })
}

/** 光标前的文本命中某个节点的输入规则时，换成那个节点并删掉标记。 */
export function applyNodeInput(doc: OjDocument): OjDocument | null {
  if (doc.selection.kind !== 'text') return null
  const hit = selected(doc)
  if (!hit || !isTextblockType(hit.node.type)) return null
  const text = blockPlain(hit.node)
  const before = text.slice(0, Math.min(doc.selection.offset, text.length))
  const match = matchNodeInput(before)
  if (!match) return null
  if (match.node === 'horizontalRule') return applyHorizontalRuleInput(doc)
  const rest = text.slice(match.consume)
  const caret: OjSelection = { kind: 'text', path: hit.path, offset: rest.length }
  if (match.node === 'heading') {
    return replaceAt(doc, hit.path, textblock('heading', rest, { level: match.level ?? 1 }), caret)
  }
  if (match.node === 'codeBlock') return replaceAt(doc, hit.path, textblock('codeBlock', rest), caret)
  const paragraph = replaceAt(doc, hit.path, textblock('paragraph', rest), caret)
  if (match.node === 'blockquote') return ancestor(paragraph, 'blockquote') ? paragraph : toggleBlockquote(paragraph)
  if (match.node === 'bulletList') {
    return ancestor(paragraph, 'bulletList') ? paragraph : toggleBulletList(paragraph)
  }
  if (match.node === 'orderedList') {
    return ancestor(paragraph, 'orderedList') ? paragraph : toggleOrderedList(paragraph)
  }
  return null
}
