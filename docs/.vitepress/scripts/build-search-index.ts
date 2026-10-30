/**
 * 构建期搜索索引（04 §4）。
 *
 * 为什么不用 VitePress 内置的 `search.provider: 'local'`：它把索引在构建期用**默认分词**
 * 建好，`themeConfig` 里塞的 `tokenize` 会被 JSON 序列化丢掉（见 config.ts 里的注释与
 * 04 §4 的实测修正）。中文文档按空格分词等于搜不到——"表格选择器"是一个词，搜"表格"落空。
 *
 * 所以这里用**同一个** `tokenizeCJK` 自己建索引，产物是一份 `MiniSearch.toJSON()`。
 * 客户端 `OjSearch.vue` 用 `MiniSearch.loadJSON(json, { tokenize: tokenizeCJK })`
 * 复原，分词规则与构建期完全一致——这是本方案唯一的正确性前提，
 * 也由 `docs/test/search-index.test.ts` 断言（用真实文档跑一次"表格"必须召回"选择器"页）。
 *
 * 产物 `docs/public/search/index.json` **入库**，`--check` 守新鲜度，
 * 与 tokens/icons/组件文档同一套做法：生成物不进 diff 就等于可以被静默改坏。
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import MiniSearch from 'minisearch'

import { SEARCH_FIELDS, SEARCH_OPTIONS, STORE_FIELDS } from '../search/options.ts'
import { tokenizeCJK } from '../search/tokenize.ts'

const here = dirname(fileURLToPath(import.meta.url))
const docsRoot = resolve(here, '..', '..')
const outFile = join(docsRoot, 'public', 'search', 'index.json')

/** 与 config.ts 的 `srcExclude` 保持一致：ADR 不进站点，也就不该进索引。 */
const EXCLUDED_DIRS = new Set(['adr', 'node_modules', 'dist', 'public', '.vitepress'])

interface Page {
  id: number
  path: string
  title: string
  headings: string
  text: string
  group: string
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDED_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

/** `guide/install.md` → `/guide/install`；干净 URL 与 config 的 `cleanUrls: true` 对齐。 */
function toRoute(file: string): string {
  const rel = relative(docsRoot, file).split(sep).join('/')
  // `index.md` → `/`、`guide/index.md` → `/guide/`（VitePress 的目录页保留尾斜杠）
  return `/${rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')}`
}

function toGroup(route: string): string {
  if (route === '/') return '概览'
  if (route.startsWith('/guide')) return '指南'
  if (route.startsWith('/components/api')) return '组件 API'
  if (route.startsWith('/components')) return '组件'
  if (route.startsWith('/playground')) return 'Playground'
  return '概览'
}

/**
 * Markdown → 纯文本。**代码块里的内容保留**：组件名（`OjRibbon`）、prop 名、命令 id
 * 大量只出现在示例代码里，丢掉它们会让"搜 API 搜不到"。
 */
function toPlainText(body: string): string {
  return body
    .replace(/```[^\n]*\n([\s\S]*?)```/g, (_match, code: string) => ` ${code} `)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^:::.*$/gm, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, ' $1 ')
    .replace(/^\s*\|.*\|\s*$/gm, (row) => row.replace(/\|/g, ' '))
    .replace(/^[>\s]*[-*+]\s+/gm, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsePage(file: string, id: number): Page {
  const raw = readFileSync(file, 'utf8')
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(raw)
  const body = frontmatter ? raw.slice(frontmatter[0].length) : raw
  const route = toRoute(file)

  const h1 = /^#\s+(.+)$/m.exec(body)?.[1]?.trim()
  // 首页是 `layout: home`，没有 h1；用 hero 的文案兜底，否则标题会是一个空串
  const heroText = frontmatter
    ? /^\s*text:\s*(.+)$/m.exec(frontmatter[1] ?? '')?.[1]?.trim()
    : undefined
  const title = toPlainText(h1 ?? heroText ?? route)

  const headings = [...body.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((match) => toPlainText(match[1] as string))
    .join(' ')

  return {
    id,
    path: route,
    title,
    headings,
    // 正文里重复一遍标题，让"整页只有一个 h1"的短页面也能被内容搜到
    text: toPlainText(body),
    group: toGroup(route),
  }
}

export function buildIndex(): string {
  const files = walk(docsRoot).sort()
  const pages = files.map((file, index) => parsePage(file, index))

  const index = new MiniSearch<Page>({
    fields: [...SEARCH_FIELDS],
    // 只存结果要显示的最小集合：正文不进 storeFields（那会把索引撑大到几百 KB），
    // 命中的小节名靠 `headings` 给用户一个"命在哪"的判断
    storeFields: [...STORE_FIELDS],
    tokenize: tokenizeCJK,
    searchOptions: SEARCH_OPTIONS,
  })
  index.addAll(pages)

  // 不加时间戳：生成物入库 + 字节级门禁，任何会随时间变化的东西都会让门禁假红
  return `${JSON.stringify({ version: 1, tokenizer: 'bigram-cjk-v1', index: index.toJSON() })}\n`
}

// 被测试 import 时不执行 CLI 副作用（`node --test` 里只借 `buildIndex`）
const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  const output = buildIndex()

  if (process.argv.includes('--check')) {
    let current = ''
    try {
      current = readFileSync(outFile, 'utf8')
    } catch {
      console.error('[search] 缺少 docs/public/search/index.json，跑 `pnpm docs:search`')
      process.exit(1)
    }
    if (current !== output) {
      console.error('[search] 索引与文档不同源，跑 `pnpm docs:search` 重新生成')
      process.exit(1)
    }
    console.log('[search] 通过 · 索引与文档同源')
  } else {
    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, output)
    const pages = (JSON.parse(output).index.documentCount as number) ?? 0
    console.log(`[search] 已生成 · ${pages} 页 · ${(output.length / 1024).toFixed(1)} KB`)
  }
}
