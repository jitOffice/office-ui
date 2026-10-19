/** 嵌套文件树。空查询返回原树；文件夹名命中时保留其全部子节点。 */

export interface FileNode {
  id: string
  name: string
  kind: 'folder' | 'file'
  children?: readonly FileNode[]
}

export function filterTree(nodes: readonly FileNode[], query: string): FileNode[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return nodes.map((node) => node)
  const walk = (node: FileNode): FileNode | null => {
    if (node.name.toLowerCase().includes(needle)) return node
    const children = node.children?.map(walk).filter((item): item is FileNode => item !== null)
    if (children && children.length > 0) return { ...node, children }
    return null
  }
  return nodes.map(walk).filter((item): item is FileNode => item !== null)
}

export function toggleId(open: readonly string[], id: string): string[] {
  return open.includes(id) ? open.filter((item) => item !== id) : [...open, id]
}
