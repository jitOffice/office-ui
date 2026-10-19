/**
 * 文档树用 Tiptap / ProseMirror 的 JSON 形状：`{ type, attrs, content, text }`。
 * 选区用从 `doc.content` 出发的下标路径，不依赖 ProseMirror。
 */

export interface OjNode {
  type: string
  attrs?: Readonly<Record<string, string | number | boolean | null>>
  text?: string
  content?: readonly OjNode[]
}

export type OjSelection =
  | { kind: 'text'; path: readonly number[]; offset: number }
  | { kind: 'node'; path: readonly number[]; offset: number }

export interface OjDocument {
  doc: OjNode
  selection: OjSelection
}

const TEXTBLOCKS = new Set(['paragraph', 'heading', 'codeBlock'])

export function isTextblockType(type: string): boolean {
  return TEXTBLOCKS.has(type)
}

export function createDocument(text = ''): OjDocument {
  return {
    doc: {
      type: 'doc',
      content: [textblock('paragraph', text)],
    },
    selection: { kind: 'text', path: [0], offset: text.length },
  }
}

export function textblock(type: string, text: string, attrs?: OjNode['attrs']): OjNode {
  const content = text.length > 0 ? [{ type: 'text', text }] : []
  return attrs ? { type, attrs, content } : { type, content }
}

/** 文本块的可见文字。硬换行算作一个换行符。 */
export function blockPlain(node: OjNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  if (!isTextblockType(node.type)) return ''
  return (node.content ?? []).map((child) => blockPlain(child)).join('')
}

export function nodeAt(root: OjNode, path: readonly number[]): OjNode | null {
  let current = root
  for (const index of path) {
    const next = current.content?.[index]
    if (!next) return null
    current = next
  }
  return current
}

export function spliceChildren(
  root: OjNode,
  parentPath: readonly number[],
  index: number,
  deleteCount: number,
  insert: readonly OjNode[],
): OjNode {
  if (parentPath.length === 0) {
    const content = [...(root.content ?? [])]
    content.splice(index, deleteCount, ...insert)
    return { ...root, content }
  }
  const [head, ...rest] = parentPath
  if (head === undefined) return root
  const content = [...(root.content ?? [])]
  const child = content[head]
  if (!child) return root
  content[head] = spliceChildren(child, rest, index, deleteCount, insert)
  return { ...root, content }
}

export interface TextblockHit {
  path: readonly number[]
  node: OjNode
  start: number
  end: number
}

/** 按阅读顺序收集文本块。块与块之间用换行符隔开，和 `plainText` 一致。 */
export function textblocks(root: OjNode): TextblockHit[] {
  const hits: TextblockHit[] = []
  let cursor = 0
  const walk = (node: OjNode, path: readonly number[]): void => {
    if (isTextblockType(node.type)) {
      const text = blockPlain(node)
      hits.push({ path, node, start: cursor, end: cursor + text.length })
      cursor += text.length + 1
      return
    }
    node.content?.forEach((child, index) => walk(child, [...path, index]))
  }
  walk(root, [])
  return hits
}

export function plainText(doc: OjDocument): string {
  return textblocks(doc.doc)
    .map((hit) => blockPlain(hit.node))
    .join('\n')
}

export function withPlain(doc: OjDocument, plain: string): OjDocument {
  const hits = textblocks(doc.doc)
  const parts = plain.split('\n')
  if (parts.length !== hits.length) return doc
  let root = doc.doc
  hits.forEach((hit, index) => {
    const text = parts[index] ?? ''
    const parentPath = hit.path.slice(0, -1)
    const at = hit.path[hit.path.length - 1]
    if (at === undefined) return
    root = spliceChildren(root, parentPath, at, 1, [textblock(hit.node.type, text, hit.node.attrs)])
  })
  return { ...doc, doc: root }
}
