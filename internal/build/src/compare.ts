/**
 * 目录树逐字节比对。产物新鲜度判定的唯一依据——"看着一样"不算一样。
 *
 * 换行符也算：入库产物由 `.gitattributes` 钉成 LF，构建输出本来就是 LF，
 * 但一旦哪天有工具在 Windows 上写出 CRLF，这里会立刻报差异，
 * 而不是等到 `pnpm lint` 在别人的克隆上误报"已过期"。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** rel path → file content（utf8）。目录不存在时返回空表。 */
function flatten(root: string, dir = root): Map<string, string> {
  const out = new Map<string, string>()
  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of names) {
    const abs = join(dir, name)
    if (statSync(abs).isDirectory()) {
      for (const [rel, content] of flatten(root, abs)) out.set(rel, content)
    } else {
      out.set(relative(root, abs).replaceAll('\\', '/'), readFileSync(abs, 'utf8'))
    }
  }
  return out
}

export function compareTrees(committed: string, rebuilt: string): string[] {
  const before = flatten(committed)
  const after = flatten(rebuilt)
  const problems: string[] = []
  for (const [rel, content] of after) {
    const existing = before.get(rel)
    if (existing === undefined) problems.push(`新增产物 ${rel} 未入库`)
    else if (existing !== content) problems.push(`${rel} 内容与源码重建结果不一致`)
  }
  for (const rel of before.keys()) {
    if (!after.has(rel)) problems.push(`${rel} 已入库但构建不再产出`)
  }
  return problems
}
