/**
 * 图标生成器（PRD 05 轨道 C1）。`svg/*.svg` 是**唯一手写源**，其余四份全是产出：
 *
 *   src/generated/icons.ts    框架无关常量：name → { viewBox, attrs, body, markup }
 *   src/generated/vue.ts      每枚图标一个具名组件（tree-shaking 的粒度单位）
 *   generated/sprite.svg      `<symbol>` 集合，无构建器页面用 `<use href="#oj-…">` 消费
 *   generated/manifest.json   canvas / 文档站 / 设计对账用的机器可读清单
 *
 * 为什么不发图标字体（PRD 00 红线 2）：字体二进制会把各字形的原始许可静默合并进一个文件、
 * 并丢掉许可文本。sprite 在无构建器场景下同样可用，没有理由承担这个风险。
 *
 * sprite 与 manifest 刻意**不直接写进 dist**：`dist` 是构建产物、由 `build:check` 逐字节比对，
 * 生成器往里写会让入库产物多出一份"构建产不出来"的文件，`--check` 立刻报「已入库但构建不再产出」。
 * 所以它们落在 `generated/`，由 `specs.ts` 的 `assets` 声明复制进 dist，这样门禁能覆盖到。
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface IconSource {
  name: string
  viewBox: string
  /** 根 `<svg>` 上除 `xmlns` / `viewBox` 之外的属性，顺序保持源文件里的顺序 */
  attrs: Record<string, string>
  /** 内部标记 */
  body: string
  /** 完整 `<svg>…</svg>`，供 `innerHTML` 直接使用 */
  markup: string
}

/**
 * 不许出现在图标里的东西。`<image>` 会让"自绘图标"变成一张位图（许可与缩放双输），
 * `<filter>` / `foreignObject` / `<script` 在 sprite 复用时行为不稳定，外链更是离线部署的直接敌人。
 */
const FORBIDDEN = ['<script', '<image', '<foreignObject', '<filter', 'href="http', "href='http"]

const SVG_ROOT = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/

export function parseIcon(name: string, raw: string): IconSource {
  const markup = raw.trim()
  const match = SVG_ROOT.exec(markup)
  if (!match) throw new Error(`${name}: 必须是单个 <svg> 元素`)
  const attrText = match[1] as string
  const body = match[2] as string

  const attrs: Record<string, string> = {}
  for (const attr of attrText.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    attrs[attr[1] as string] = attr[2] as string
  }

  const viewBox = attrs['viewBox']
  if (!viewBox) throw new Error(`${name}: 缺 viewBox。没有它就无法缩放，也无法进 sprite`)

  // 尺寸由消费方决定（`size` prop 或 CSS）：写在源文件里会让 24px 的按钮里出现 16px 的图标。
  for (const dimension of ['width', 'height']) {
    if (attrs[dimension] !== undefined) {
      throw new Error(`${name}: 根元素不许写 ${dimension}，尺寸交给消费方`)
    }
  }

  for (const token of FORBIDDEN) {
    if (markup.includes(token)) throw new Error(`${name}: 含禁止的内容 ${token}（图标必须自绘且离线可用）`)
  }

  // 没有 currentColor 就无法跟随文字颜色，暗色主题与禁用态会各自失效。
  if (!markup.includes('currentColor')) {
    throw new Error(`${name}: 没有 currentColor。图标必须继承文字颜色，否则暗色/禁用态会失真`)
  }

  const { viewBox: _v, xmlns: _x, ...paint } = attrs
  void _v
  void _x
  return { name, viewBox, attrs: paint, body, markup }
}

/** 读源目录并按名字排序（排序是为了产物确定：同一份源必须逐字节产出同一份文件）。 */
export function readSources(): IconSource[] {
  const svgDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'svg')
  const files = readdirSync(svgDir)
    .filter((name) => name.endsWith('.svg'))
    .sort()
  const seen = new Set<string>()
  return files.map((file) => {
    const name = file.slice(0, -'.svg'.length)
    if (seen.has(name)) throw new Error(`图标名重复：${name}`)
    seen.add(name)
    return parseIcon(name, readFileSync(join(svgDir, file), 'utf8'))
  })
}

const HEADER = '/** 由 scripts/generate.ts 生成，不要手改。手写源是 packages/icons/svg/*.svg。 */'

export function emitConstants(sources: IconSource[]): string {
  const entries = sources.map((icon) =>
    [
      `  ${JSON.stringify(icon.name)}: {`,
      `    viewBox: ${JSON.stringify(icon.viewBox)},`,
      `    attrs: ${JSON.stringify(icon.attrs)},`,
      `    body: ${JSON.stringify(icon.body)},`,
      `    markup: ${JSON.stringify(icon.markup)},`,
      '  },',
    ].join('\n'),
  )
  return [
    HEADER,
    '',
    'export interface OjIconSource {',
    '  readonly viewBox: string',
    '  readonly attrs: Readonly<Record<string, string>>',
    '  readonly body: string',
    '  readonly markup: string',
    '}',
    '',
    'export const icons = {',
    ...entries,
    '} as const satisfies Record<string, OjIconSource>',
    '',
    'export type OjIconName = keyof typeof icons',
    '',
    '/** 名字查标记；名字不在表里返回 undefined（而不是空串：空串会让 `<span>` 静默变空白）。 */',
    'export function iconMarkup(name: string): string | undefined {',
    '  return Object.prototype.hasOwnProperty.call(icons, name)',
    '    ? icons[name as OjIconName].markup',
    '    : undefined',
    '}',
    '',
  ].join('\n')
}

/** `oj-format-bold` → `OjIconFormatBold`。组件名是公开 API，改名等于破坏性变更。 */
export function componentName(iconName: string): string {
  const core = iconName.startsWith('oj-') ? iconName.slice(3) : iconName
  return `OjIcon${core
    .split('-')
    .map((part) => (part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')}`
}

export function emitComponents(sources: IconSource[]): string {
  const lines = sources.map(
    (icon) =>
      `export const ${componentName(icon.name)} = /* @__PURE__ */ createIconComponent(${JSON.stringify(icon.name)}, ${JSON.stringify(componentName(icon.name))}, ${JSON.stringify(icon.markup)})`,
  )
  const table = sources.map(
    (icon) => `  ${JSON.stringify(icon.name)}: ${componentName(icon.name)},`,
  )
  return [
    HEADER,
    '//',
    '// 每枚图标一个具名导出的理由：`import { OjIconFormatBold } from \'@jitoffice/icons/vue\'`',
    '// 单独打包后必须 ≤ 1 KB（05 C1 验收）。聚合对象会把这个承诺变成"看打包器心情"。',
    '//',
    '// markup 是**内联字面量**而不是从常量表里取 `icons[name].markup`：后者看起来更 DRY，',
    '// 但 esbuild/rollup 折不动函数参数，会把整张 31 枚的表都带进单图标产物里。',
    '//',
    '// `/* @__PURE__ */` 不是装饰：没有它，31 个顶层 `createIconComponent(...)` 调用会被当成',
    '// 有副作用的语句**一直保留**，`import { OjIconFormatBold }` 的产物里会躺满另外 30 个图标。',
    '// 实测：不加 2.13 kB、加了 0.9 kB（gzip，阈值 1 kB）——门禁就是这么抓出来的。',
    '',
    "import { createIconComponent } from '../icon-component.ts'",
    '',
    ...lines,
    '',
    '/** 动态查表用（Ribbon 从命令 id 找图标）。静态导入请直接用上面的具名导出。 */',
    'export const iconComponents = {',
    ...table,
    '} as const',
    '',
  ].join('\n')
}

/** 根 `<svg>` 上的绘制属性要搬到 `<symbol>` 上，否则复用出来的图形会丢 stroke/fill。 */
function symbolAttrs(icon: IconSource): string {
  return Object.entries(icon.attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('')
}

export function emitSprite(sources: IconSource[]): string {
  const symbols = sources.map(
    (icon) => `  <symbol id="${icon.name}" viewBox="${icon.viewBox}"${symbolAttrs(icon)}>${icon.body}</symbol>`,
  )
  return [
    '<!-- 由 scripts/generate.ts 生成，不要手改。用法：<svg><use href="sprite.svg#oj-format-bold"/></svg> -->',
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">',
    ...symbols,
    '</svg>',
    '',
  ].join('\n')
}

export function emitManifest(sources: IconSource[]): string {
  const manifest = {
    generatedBy: 'packages/icons/scripts/generate.ts',
    note: 'canvas 消费方用 body + attrs 自行绘制；不要在运行时解析 markup 字符串。',
    icons: sources.map((icon) => ({
      name: icon.name,
      viewBox: icon.viewBox,
      attrs: icon.attrs,
      body: icon.body,
    })),
  }
  return `${JSON.stringify(manifest, null, 2)}\n`
}

/** 相对包目录的路径 → 文件内容。门禁与构建共用这一份，避免"生成"和"校验"各写一遍。 */
export function buildArtifacts(): Record<string, string> {
  const sources = readSources()
  return {
    'src/generated/icons.ts': emitConstants(sources),
    'src/generated/vue.ts': emitComponents(sources),
    'generated/sprite.svg': emitSprite(sources),
    'generated/manifest.json': emitManifest(sources),
  }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const invokedDirectly = process.argv[1] ? resolve(process.argv[1]) === resolve(import.meta.filename) : false

if (invokedDirectly) {
  const artifacts = buildArtifacts()
  for (const [rel, content] of Object.entries(artifacts)) {
    const target = join(root, rel)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  const count = readSources().length
  console.log(`[icons] ${count} 枚图标 → ${Object.keys(artifacts).length} 个产物（常量 / 组件 / sprite / manifest）`)
}
