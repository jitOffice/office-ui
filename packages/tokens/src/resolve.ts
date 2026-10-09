/**
 * 构建期解析：分层合并 + var() 展开 + 校验。
 *
 * 只在生成器与测试里运行，不进运行时产物 —— dist/index.js 自带一份极小的合并函数。
 */

import { CSS_PREFIX, entries, type DensityName, type Entry, type LangName, type ThemeName } from './tokens.ts'

const VAR_RE = /var\((--oj-[a-z0-9-]+)\)/g

/** 路径段 → CSS 变量名片段。camelCase 段展开为 kebab-case。 */
export function kebab(segment: string): string {
  return segment.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
}

export function cssVarName(path: string): string {
  return CSS_PREFIX + path.split('.').map(kebab).join('-')
}

export type RawMap = Record<string, string>
export type ResolvedMap = Record<string, string>

/**
 * 取出某一组合（主题 × 密度 × 语言）下的原始值表。覆写优先级：语言 > 密度 > 主题，
 * 与 CSS 规则块的先后顺序一致；未覆写的 token 继承基底值。
 */
export function pick(e: Entry, theme: ThemeName, density: DensityName, lang: LangName): string {
  if (lang === 'ja' && e.ja !== undefined) return e.ja
  if (lang === 'zh-TW' && e.zhTw !== undefined) return e.zhTw
  if (density === 'compact' && e.compact !== undefined) return e.compact
  if (theme === 'dark') return e.dark ?? e.light
  return e.light
}

export function buildRawMap(theme: ThemeName, density: DensityName = 'comfortable', lang: LangName = 'zh'): RawMap {
  const map: RawMap = {}
  for (const e of entries) map[cssVarName(e.path)] = pick(e, theme, density, lang)
  return map
}

/**
 * 展开 `var(--oj-*)`。必须在**合并后的主题表**上展开，而不是在 seed 表上，
 * 否则暗色下的 `--oj-text-brand` 会拿到亮色品牌色。
 */
export function resolveMap(raw: RawMap): ResolvedMap {
  const out: ResolvedMap = {}
  for (const key of Object.keys(raw)) out[key] = resolveValue(key, raw, [])
  return out
}

function resolveValue(key: string, raw: RawMap, stack: string[]): string {
  const value = raw[key]
  if (value === undefined) throw new Error(`Unknown token reference: var(${key})`)
  if (stack.includes(key)) throw new Error(`Cyclic token reference: ${[...stack, key].join(' -> ')}`)
  if (!value.includes('var(')) return value
  return value.replace(VAR_RE, (_m, ref: string) => resolveValue(ref, raw, [...stack, key]))
}

/** 校验注册表本身：重复路径、悬空引用、自引用。 */
export function validateRegistry(): string[] {
  const problems: string[] = []
  const declared = new Map<string, Entry>()

  for (const e of entries) {
    const name = cssVarName(e.path)
    if (declared.has(name)) problems.push(`Duplicate path "${e.path}" -> ${name}`)
    declared.set(name, e)
  }

  for (const e of entries) {
    const name = cssVarName(e.path)
    for (const field of ['light', 'dark', 'compact', 'zhTw', 'ja'] as const) {
      const v = e[field]
      if (v === undefined) continue
      for (const m of v.matchAll(VAR_RE)) {
        const ref = m[1] as string
        if (ref === name) problems.push(`${name}.${field} references itself`)
        else if (!declared.has(ref)) problems.push(`${name}.${field} references unknown token ${ref}`)
      }
    }
  }

  // 树安全：任一路径不得是另一路径的严格前缀，否则 dist 的嵌套 JS 树里
  // 同一个键既要当叶子又要当父节点，后写入的一方被静默覆盖。
  const paths = entries.map((e) => e.path.split('.'))
  for (const a of paths) {
    for (const b of paths) {
      if (a === b || a.length >= b.length) continue
      if (b.slice(0, a.length).join('.') === a.join('.')) {
        problems.push(`Tree collision: "${a.join('.')}" is a leaf and a prefix of "${b.join('.')}"`)
      }
    }
  }

  return problems
}

/** 全组合解析，供产物发射与测试遍历。 */
export function allCombinations(): { theme: ThemeName; density: DensityName; lang: LangName }[] {
  const out: { theme: ThemeName; density: DensityName; lang: LangName }[] = []
  for (const theme of ['light', 'dark'] as ThemeName[])
    for (const density of ['comfortable', 'compact'] as DensityName[])
      for (const lang of ['zh', 'zh-TW', 'ja'] as LangName[]) out.push({ theme, density, lang })
  return out
}
