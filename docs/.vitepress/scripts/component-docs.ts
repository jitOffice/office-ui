/**
 * 组件文档自动生成（04 §5）。
 *
 * 为什么必须自动化：PRD 原话是"CSS 变量表由构建期扫描组件源码自动生成——**这是必须自动化的点**，
 * 手写文档一定漏"。34 个组件 × 平均 5 个 `var(--oj-*)`，靠人记是记不住的，而漏掉的后果很具体：
 * 使用者找不到钩子，就会去覆盖 `.oj-xxx__elem` 这种内部结构，下次重构就断。
 *
 * 取舍（写在这里而不是埋在代码里）：PRD 指定用 `vue-component-meta` 走 Volar 类型系统。
 * 本轮先做**行级扫描**——本库组件全部是 `defineComponent({ props: { … } })` 且缩进统一，
 * 行级解析能稳定拿到 prop 名、是否必填与默认值；复杂类型（泛型、联合）直接留给源码链接。
 * 换来的是零新依赖、`node --test` 里可测。类型级精确展开（含「展开交叉类型」）排在下一轮。
 *
 * 生成物**入库**，并用 `--check` 做新鲜度门禁（与 tokens / icons 同一套做法）：
 * 改了组件忘了重跑，CI 立刻红，而不是线上文档慢慢失真。
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface PropRow {
  name: string
  required: boolean
  /** 默认值的源码写法；对象/数组这类复杂默认值折成 `{…}`，不假装能完整表达 */
  defaultValue: string
}

export interface ComponentDoc {
  /** `OjRibbonGroup` */
  name: string
  /** 相对仓库根的源码路径 */
  file: string
  /** BEM block，如 `oj-ribbon-group` */
  block: string
  props: PropRow[]
  cssVars: string[]
  i18nKeys: string[]
}

/** 从 `{` 起做括号配平，拿到这段对象的体（含花括号）。找不到闭合时返回空串。 */
function objectAt(source: string, openAt: number): string {
  if (source[openAt] !== '{') return ''
  let depth = 0
  for (let index = openAt; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(openAt, index + 1)
    }
  }
  return ''
}

/** `OjRibbonGroup` → `ribbon-group`（去掉 `Oj` 前缀再转 kebab）。 */
export function kebabOf(name: string): string {
  return name
    .replace(/^Oj/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

/** 默认值：只取字面量；对象/数组/函数折成占位，避免在表里放半截表达式。 */
function defaultOf(text: string): string {
  const literal = /default:\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`|([A-Za-z0-9_.-]+))/.exec(text)
  if (literal) return literal[1] ?? literal[2] ?? literal[3] ?? literal[4] ?? '—'
  if (/default:\s*[{[[]/.test(text)) return '{…}'
  return '—'
}

/**
 * props 体里每个 `name: { … }` 是一行声明（缩进固定 4 空格）。
 *
 * 不按"顶层逗号切分"是因为 prop 值里会出现 `PropType<Record<string, string>>`、
 * `(value: string) => void` 这类带逗号/箭头的表达式；按缩进切不需要理解这些语法，
 * 代价是要求声明各占一行——本库所有组件都满足，用例里有断言守着。
 */
function parseProps(source: string): PropRow[] {
  const marker = 'props: {'
  const at = source.indexOf(marker)
  if (at < 0) return []
  const body = objectAt(source, at + marker.length - 1)
  if (body === '') return []

  const rows: PropRow[] = []
  const lines = body.split('\n')
  for (let index = 1; index < lines.length; index += 1) {
    const head = /^ {4}([A-Za-z][\w]*):\s*\{(.*)$/.exec(lines[index] as string)
    if (!head) continue
    const name = head[1] as string
    let text = head[2] as string
    // 多行声明：一直收集到出现闭合花括号
    let cursor = index
    while (!text.includes('}') && cursor + 1 < lines.length) {
      cursor += 1
      text += ` ${(lines[cursor] as string).trim()}`
    }
    rows.push({ name, required: /required:\s*true/.test(text), defaultValue: defaultOf(text) })
    index = cursor
  }
  return rows
}

/** 组件根 class 的 block（`class: 'oj-ribbon-group'`），拿不到就从组件名推。 */
function blockOf(source: string, name: string): string {
  for (const match of source.matchAll(/class:\s*'([^'\n]+)'/g)) {
    for (const token of (match[1] as string).split(/\s+/)) {
      if (!/^oj-[a-z0-9-]+$/.test(token)) continue
      return token.split('__')[0]?.split('--')[0] ?? kebabOf(name)
    }
  }
  return `oj-${kebabOf(name)}`
}

/**
 * 扫描前先剥注释——这条是被两次误报逼出来的。
 *
 * 注释里写 `name: 'OjXxx'` 举例说明，扫描器就当成了一个组件，凭空生成 `xxx.md`；
 * 写 `name: 'OjCommandRoot'` 解释包装组件，又生成 `command-root.md`。
 * 块注释替换成等量换行而不是空串：props 解析靠 4 空格缩进切行，行结构不能塌。
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ''))
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

export function scanSource(file: string, rawSource: string): ComponentDoc | undefined {
  const source = stripComments(rawSource)
  const name = /name:\s*'(Oj[A-Za-z0-9]+)'/.exec(source)?.[1]
  if (name === undefined) return undefined

  const cssVars = [...new Set([...source.matchAll(/var\((--oj-[a-z0-9-]+)/g)].map((m) => m[1] as string))].sort()
  const i18nKeys = [...new Set([...source.matchAll(/'(oj\.[A-Za-z0-9_.]+)'/g)].map((m) => m[1] as string))].sort()

  return {
    name,
    file,
    block: blockOf(source, name),
    props: parseProps(source),
    cssVars,
    i18nKeys,
  }
}

function cell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

export function renderPage(doc: ComponentDoc): string {
  const lines: string[] = [
    `# ${doc.name}`,
    '',
    `> 本页由 \`docs/.vitepress/scripts/component-docs.ts\` 扫描源码生成，**请勿手改**。`,
    `> 改组件后跑 \`pnpm docs:gen\`；忘记重跑会被 \`pnpm lint:docs\` 拦下。`,
    '',
    `- 源码：\`${doc.file}\``,
    `- 样式块：\`.${doc.block}\``,
    '',
    '## Props',
    '',
  ]

  if (doc.props.length === 0) {
    lines.push('该组件的 props 声明不在扫描范围内（或使用了非对象字面量写法），请看源码。')
  } else {
    lines.push('| Prop | 必填 | 默认值 |', '|---|---|---|')
    for (const prop of doc.props) {
      lines.push(`| \`${prop.name}\` | ${prop.required ? '是' : '否'} | ${cell(`\`${prop.defaultValue}\``)} |`)
    }
  }

  lines.push('', '## CSS 变量', '')
  if (doc.cssVars.length === 0) {
    lines.push('该组件没有直接引用 `--oj-*` 变量：样式继承自外层 block。')
  } else {
    lines.push('| 变量 |', '|---|')
    for (const variable of doc.cssVars) lines.push(`| \`${variable}\` |`)
  }

  if (doc.i18nKeys.length > 0) {
    lines.push('', '## 国际化', '', '| key |', '|---|')
    for (const key of doc.i18nKeys) lines.push(`| \`${key}\` |`)
  }

  lines.push(
    '',
    '## 无障碍',
    '',
    '- 纯图标控件必须声明意图：给 `label`（有语义）或 `decorative`（装饰性），两者皆无时开发模式告警。',
    '- 菜单/浮层类组件关闭后**归还焦点**；菜单内上下键环绕并跳过禁用项。',
    '',
  )
  return lines.join('\n')
}

export interface Generated {
  /** 相对仓库根的路径 → 文件内容 */
  files: Map<string, string>
}

/** 生成全部产物（纯内存，便于 `--check` 与测试复用）。 */
export function generate(repoRoot: string): Generated {
  const vueDir = join(repoRoot, 'packages', 'ui', 'src', 'vue')
  const files = new Map<string, string>()
  const pages: { text: string; link: string }[] = []

  for (const entry of readdirSync(vueDir).sort()) {
    if (!entry.endsWith('.ts') || entry === 'index.ts') continue
    const absolute = join(vueDir, entry)
    const doc = scanSource(relative(repoRoot, absolute), readFileSync(absolute, 'utf8'))
    if (doc === undefined) continue
    const slug = kebabOf(doc.name)
    files.set(`docs/components/api/${slug}.md`, renderPage(doc))
    pages.push({ text: doc.name, link: `/components/api/${slug}` })
  }

  const index = [
    '# 组件 API 索引',
    '',
    `> 由源码扫描生成（${pages.length} 个组件），请勿手改。`,
    '',
    '| 组件 |',
    '|---|',
    ...pages.map((page) => `| [${page.text}](${page.link}) |`),
    '',
  ].join('\n')
  files.set('docs/components/api/index.md', index)

  const sidebar = [
    '/** 由 docs/.vitepress/scripts/component-docs.ts 生成，请勿手改。 */',
    'export const componentPages: readonly { text: string; link: string }[] = [',
    ...pages.map((page) => `  { text: '${page.text}', link: '${page.link}' },`),
    ']',
    '',
  ].join('\n')
  files.set('docs/.vitepress/generated/components.ts', sidebar)

  return { files }
}

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..', '..')
const invokedDirectly = process.argv[1] ? resolve(process.argv[1]) === resolve(import.meta.filename) : false

if (invokedDirectly) {
  const check = process.argv.includes('--check')
  const { files } = generate(repoRoot)
  const problems: string[] = []

  for (const [relativePath, content] of files) {
    const absolute = join(repoRoot, relativePath)
    if (check) {
      const current = existsSync(absolute) ? readFileSync(absolute, 'utf8') : undefined
      if (current !== content) problems.push(relativePath)
      continue
    }
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, content)
  }

  if (check) {
    if (problems.length > 0) {
      console.error(`[docs] ${problems.length} 份组件文档与源码不同步：`)
      for (const problem of problems.slice(0, 10)) console.error(`  - ${problem}`)
      console.error('  跑 `pnpm docs:gen` 重新生成并提交')
      process.exit(1)
    }
    console.log(`[docs] 通过 · ${files.size} 份组件文档与源码同步`)
  } else {
    console.log(`[docs] 已生成 ${files.size} 份组件文档 → docs/components/api/`)
  }
}
