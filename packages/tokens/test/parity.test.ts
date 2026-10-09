/**
 * 双产物同源性验收。
 *
 * 这是整个 tokens 包最关键的一条测试：它**独立解析 dist/index.css 的文本**，
 * 按 CSS 级联顺序重建每个主题组合的变量表，再与 src 的解析结果逐一对账。
 * 发射器写错级联顺序、漏发覆写、变量名推导错，都会在这里暴露，
 * 而不是等到用户切暗色发现 canvas 与 DOM 颜色不一致。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { allCombinations, buildRawMap, cssVarName, kebab, resolveMap, validateRegistry } from '../src/resolve.ts'
import { entries } from '../src/tokens.ts'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

function readArtifact(name: string): string {
  try {
    return readFileSync(join(dist, name), 'utf8')
  } catch {
    throw new Error(`缺少产物 dist/${name}，先运行：node packages/tokens/scripts/generate.ts`)
  }
}

const css = readArtifact('index.css')

/** 只处理本产物的扁平结构：值里不含 `{`。 */
function parseBlocks(text: string): Map<string, Record<string, string>> {
  const blocks = new Map<string, Record<string, string>>()
  for (const m of text.matchAll(/([^{}\n][^{}]*?)\{([^{}]*)\}/g)) {
    const selector = (m[1] as string).trim().replace(/\s+/g, ' ')
    const decls: Record<string, string> = {}
    for (const d of (m[2] as string).matchAll(/(--oj-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      decls[d[1] as string] = (d[2] as string).trim()
    }
    blocks.set(selector, decls)
  }
  return blocks
}

const blocks = parseBlocks(css)

function blockFor(...needles: string[]): Record<string, string> {
  const selector = [...blocks.keys()].find((s) => needles.every((n) => s.includes(n)))
  assert.ok(selector, `产物里找不到选择器 ${needles.join(' + ')}`)
  return blocks.get(selector as string) as Record<string, string>
}

const rootBlock = blockFor(':root')
const darkBlock = blockFor('data-oj-theme="dark"')
const compactBlock = blockFor('data-oj-density="compact"')
const twBlock = blockFor('lang|="zh-TW"')
const jaBlock = blockFor('lang|="ja"')

/** 复刻 CSS 级联：后者胜出。顺序必须与生成器写出的顺序一致。 */
function cascade(theme: 'light' | 'dark', density: string, lang: string): Record<string, string> {
  const merged: Record<string, string> = { ...rootBlock }
  if (theme === 'dark') Object.assign(merged, darkBlock)
  if (density === 'compact') Object.assign(merged, compactBlock)
  if (lang === 'ja') Object.assign(merged, jaBlock)
  if (lang === 'zh-TW') Object.assign(merged, twBlock)
  return merged
}

function expandVars(table: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  const resolveOne = (name: string, seen: string[]): string => {
    const raw = table[name]
    assert.ok(raw !== undefined, `CSS 里没有 ${name}`)
    assert.ok(!seen.includes(name), `循环引用：${[...seen, name].join(' -> ')}`)
    return raw.replace(/var\((--oj-[a-z0-9-]+)\)/g, (_m, ref: string) => resolveOne(ref, [...seen, name]))
  }
  for (const name of Object.keys(table)) out[name] = resolveOne(name, [])
  return out
}

test('注册表自身合法：无重复路径、无悬空引用、无树冲突', () => {
  assert.deepEqual(validateRegistry(), [])
})

test('每个注册条目都在 :root 里出现一次', () => {
  assert.equal(Object.keys(rootBlock).length, entries.length, ':root 变量数与注册表条目数不一致')
  for (const e of entries) assert.equal(cssVarName(e.path) in rootBlock, true, `缺少 ${cssVarName(e.path)}`)
})

test('全部 12 个组合：CSS 文本解析结果与 src 解析结果逐项相等', () => {
  for (const c of allCombinations()) {
    const fromCss = expandVars(cascade(c.theme, c.density, c.lang))
    const fromSrc = resolveMap(buildRawMap(c.theme, c.density, c.lang))
    const names = Object.keys(fromSrc)
    assert.deepEqual(Object.keys(fromCss).sort(), names.sort(), `${c.theme}.${c.density}.${c.lang} 变量集合不一致`)
    for (const name of names) {
      assert.equal(fromCss[name], fromSrc[name], `${c.theme}.${c.density}.${c.lang} 的 ${name} 不一致`)
    }
  }
})

test('暗色覆写只包含真正变化的变量，色板按索引镜像', () => {
  const darkEntries = entries.filter((e) => e.dark !== undefined && e.dark !== e.light)
  assert.equal(Object.keys(darkBlock).length, darkEntries.length)

  const light = buildRawMap('light')
  assert.equal(darkBlock['--oj-brand-1'], light['--oj-brand-10'])
  assert.equal(darkBlock['--oj-brand-9'], light['--oj-brand-2'])
  assert.equal(darkBlock['--oj-brand-6'], '#4080FF')

  // var() 必须在合并后的主题表上展开：暗色下的品牌文字不能是亮色 #165DFF
  assert.equal(resolveMap(buildRawMap('dark'))['--oj-text-brand'], '#4080FF')
  assert.equal(resolveMap(buildRawMap('light'))['--oj-text-brand'], '#165DFF')
})

test('JS 产物不含任何 var()，全部是已解析字面值', async () => {
  const mod = (await import('../dist/index.js')) as {
    tokens: Record<string, unknown>
    createTokens: (o?: { theme?: string; density?: string; lang?: string }) => Record<string, unknown>
    tokenNames: string[]
  }
  const flat = flatten(mod.tokens)
  for (const [name, value] of Object.entries(flat)) {
    assert.ok(!value.includes('var('), `${name} 仍是 var()，canvas 拿不到值`)
  }
})

test('JS 产物与 CSS 产物在 12 个组合上完全一致', async () => {
  const mod = (await import('../dist/index.js')) as {
    createTokens: (o?: { theme?: string; density?: string; lang?: string }) => Record<string, unknown>
    tokenNames: string[]
  }
  const expected = new Map<string, Record<string, string>>()
  for (const c of allCombinations()) expected.set(`${c.theme}.${c.density}.${c.lang}`, resolveMap(buildRawMap(c.theme, c.density, c.lang)))

  for (const [key, want] of expected) {
    const [theme, density, lang] = key.split('.') as ['light' | 'dark', string, string]
    const got = flatten(mod.createTokens({ theme, density, lang }))
    assert.deepEqual(Object.keys(got).sort(), Object.keys(want).sort(), `${key} 的变量集合不一致`)
    for (const name of Object.keys(want)) assert.equal(got[name], want[name], `${key} 的 ${name} 不一致`)
  }
})

test('tokenNames 与注册表变量名集合相同', async () => {
  const mod = await import('../dist/index.js')
  assert.deepEqual([...mod.tokenNames].sort(), Object.keys(rootBlock).sort())
})

/**
 * 类型产物也是第三张脸。这一条是 tsc 逼出来的：`OjTokens` 原先手写成
 * `[group: string]: Record<string, unknown>`，运行时值与 CSS 都对得上，但用户侧
 * `tokens.bg.contaier` 一样编译通过并拿到 `unknown`——163 个变量等于没有类型。
 * 这里不看生成器的内部状态，独立解析产物文本，因此 d.ts 改回索引签名或漏发字段都会失败。
 */
test('类型产物与注册表同源：d.ts 的叶子路径必须等于注册表路径集合', () => {
  const dts = readArtifact('index.d.ts')
  assert.equal(dts.includes('[group: string]'), false, '索引签名会让拼错的 token 路径静默通过')

  const marker = 'export type OjTokens = {'
  const start = dts.indexOf(marker)
  assert.ok(start >= 0, 'd.ts 必须导出 OjTokens 类型')

  const stack: string[] = []
  const leaves: string[] = []
  for (const raw of dts.slice(start + marker.length).split('\n')) {
    const line = raw.trim()
    if (line === '' || line.startsWith('/*') || line.startsWith('export')) continue
    if (line === '}') {
      if (stack.length === 0) break
      stack.pop()
      continue
    }
    const branch = line.match(/^([A-Za-z0-9_$]+): \{$/)
    if (branch) {
      stack.push(branch[1] as string)
      continue
    }
    const leaf = line.match(/^([A-Za-z0-9_$]+): string,?$/)
    assert.ok(leaf !== null, `d.ts 里出现无法解析的行：${line}`)
    leaves.push([...stack, leaf?.[1] as string].join('.'))
  }

  assert.deepEqual([...new Set(leaves)].sort(), entries.map((e) => e.path).sort())
})

/** 树 → 扁平变量表。键按 CSS 命名规则转 kebab-case。 */
function flatten(tree: Record<string, unknown>, prefix: string[] = []): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key]
    if (typeof value === 'object' && value !== null) Object.assign(out, flatten(value as Record<string, unknown>, path))
    else out['--oj-' + path.map(kebab).join('-')] = String(value)
  }
  return out
}
