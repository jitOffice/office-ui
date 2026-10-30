/**
 * 组件样式门禁（05 §2 DoD #3 / 02 §2.1）。
 *
 * 02 §2.1 原文要求的断言是「构建后检查每个组件的 style 入口产物里仍含 CSS 引用」，
 * 那是"每组件一个 style 入口"的架构（Element Plus 那套）才有的产物形态。
 * 本仓库按 ADR-0003 只发**一份** CSS，没有逐组件样式入口可被摇掉，所以风险换了个方向：
 *
 *   1. 组件用了一个类名，而样式表里没有它的规则 —— 按需引入之后该组件是"裸的"，
 *      这正是 DoD #3 要防的那件事（只是发生原因不同）。
 *   2. 样式表里有一条规则，而没有任何组件用这个 block —— 死规则，通常是重命名后漏改，
 *      它不会报错、只会让后人以为那个类还活着。
 *
 * 粒度选 **block**（`oj-dialog`）而不是完整类名（`oj-dialog__footer--dense`）：组件里的类名大量
 * 靠条件与模板拼出来（`class: horizontal ? 'oj-ruler oj-ruler--h' : …`），按完整类名比对会被
 * 拼接写法整片漏掉；block 粒度不受拼接影响，也不会因为"某个 __elem 故意没样式"而误报。
 *
 * 图标 id（`oj-format-bold`）与类名长得一样，必须剔除：它来自 `@jitoffice/icons` 的 manifest，
 * 用数据判断而不是白名单——白名单会漂移（见 05 里 `--oj-gp-cols` 那次）。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const uiRoot = join(repoRoot, 'packages', 'ui')

/**
 * 已登记但没有样式的**结构钩子**。两类：定位用的一次性包裹元素（`oj-tooltip-anchor`），
 * 与给测试/宿主用的选择器（`oj-dropdown__trigger`）。它们不进 CSS 是设计，不是遗漏——
 * 但每加一条都要在这里写清理由，否则下一个人分不清"故意"与"忘了"。
 */
const STRUCTURAL_HOOKS: Record<string, string> = {
  'oj-tooltip-anchor': '定位锚点，只承载 getBoundingClientRect，不需要任何声明',
  'oj-button__label': '按钮内的文本槽，字号/颜色全部继承按钮本身',
  'oj-dropdown__trigger': '触发器钩子，样式由外层的 .oj-button 提供',
  'oj-dialog__confirm': '确认按钮钩子，样式由 .oj-dialog__footer .oj-button 提供',
  'oj-palette-list': 'listbox 的 id（给 aria-controls / aria-activedescendant 用），不是类名',
}

/** 一个类名 token → 它所属的 block（`oj-dialog__footer--dense` → `oj-dialog`）。 */
function blockOf(token: string): string {
  return token.split('__')[0]!.split('--')[0]!
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) walk(path, out)
    else if (entry.name.endsWith('.ts')) out.push(path)
  }
  return out
}

/**
 * 从源码里提取 `oj-*` 类名 token。
 *
 * 分两步，顺序不能颠倒：
 *   1. **class 上下文**（`class:` / `class=` 之后那一行里所有字符串字面量）：拼接与三元都覆盖，
 *      例如 `class: horizontal ? 'oj-ruler oj-ruler--h' : 'oj-ruler oj-ruler--v'`。
 *   2. **其余全部字符串字面量**，并剔除"只作图标引用"的 token（`name: 'oj-format-bold'`）。
 *
 * 第 2 步的剔除踩过一次坑：`oj-ai` / `oj-code` / `oj-search` / `oj-signature` / `oj-stamp` /
 * `oj-watermark` 六个名字**同时是图标 id 和组件根类名**，按 manifest 一刀切会把真实类名一起削掉，
 * 于是门禁把 6 条活着的样式规则报成"死规则"。先跑第 1 步就不会误伤。
 */
function classTokens(files: string[]): { tokens: Map<string, string> } {
  const tokens = new Map<string, string>()
  for (const file of files) {
    // 注释里的示例类名不算使用：`// 例如 class="oj-foo"` 会让门禁以为 oj-foo 还活着
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
    const where = relative(repoRoot, file)
    const add = (token: string): void => {
      if (!/^oj-[a-z0-9-]+$/.test(token)) return
      if (!tokens.has(token)) tokens.set(token, where)
    }
    const literals = (text: string): string[] => {
      const found: string[] = []
      for (const literal of text.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)) {
        found.push(literal[1] ?? literal[2] ?? literal[3] ?? '')
      }
      return found
    }

    for (const context of source.matchAll(/class\s*[:=]\s*([^\n]+)/g)) {
      for (const literal of literals(context[1] as string)) {
        for (const token of literal.split(/[\s,;]+/)) add(token)
      }
    }

    // 图标引用同样要按"`name:` 之后整行"取，不能只认 `name: 'oj-x'` 一种写法：
    // `name: open ? 'oj-chevron-down' : 'oj-chevron-right'` 就漏了，会让两个图标名被当成类名。
    const iconRefs = new Set<string>()
    for (const context of source.matchAll(/name\s*[:=]\s*([^\n]+)/g)) {
      for (const literal of literals(context[1] as string)) {
        for (const token of literal.split(/[\s,;]+/)) iconRefs.add(token)
      }
    }

    // **作为对象键**的字符串永远不是 DOM class：`{ 'oj-zoom-control': OjZoomControl }` 是
    // 组件注册表（02 §4.2 的名字 → 组件映射），不是 `class:` 的写法。不剔除的话，
    // 注册表会一次性"引用"全部 34 个组件名，把没写 `class:` 的组件报成裸组件——
    // 这是语法事实，不是启发式：class 只会出现在值的位置。
    const keyRefs = new Set<string>()
    for (const context of source.matchAll(/'([^'\n]*)'\s*:|"([^"\n]*)"\s*:/g)) {
      for (const literal of [context[1] ?? context[2] ?? '']) {
        for (const token of literal.split(/[\s,;]+/)) keyRefs.add(token)
      }
    }

    // `Symbol('oj-locale')` 的**描述不是类名**：注入 key 与 block 同名只是为了好找，
    // 它永远不会挂到 DOM 上。按调用上下文剔除，而不是给命名加限制——限制会逼着下一个人
    // 换个名字绕过去，两种键名从此并存。
    const symbolRefs = new Set<string>()
    for (const context of source.matchAll(/Symbol(?:\.for)?\s*\(\s*([^\n)]*)/g)) {
      for (const literal of literals(context[1] as string)) {
        for (const token of literal.split(/[\s,;]+/)) symbolRefs.add(token)
      }
    }

    for (const literal of literals(source)) {
      for (const token of literal.split(/[\s,;]+/)) {
        if (iconRefs.has(token) || symbolRefs.has(token) || keyRefs.has(token)) continue
        add(token)
      }
    }
  }
  return { tokens }
}

/** 样式表里出现过规则的 block。 */
function styledBlocks(): Set<string> {
  const css = readFileSync(join(uiRoot, 'src', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const blocks = new Set<string>()
  for (const match of css.matchAll(/\.(oj-[a-z0-9-]+)/g)) blocks.add(blockOf(match[1] as string))
  return blocks
}

const components = classTokens(walk(join(uiRoot, 'src', 'vue')))
// demo 是"外壳可演示"的页面，它的类（oj-shell/oj-stage/oj-paper…）同样要出现在样式表里，
// 否则 demo 会静默变形；但它不参与"组件必须有样式"那一条。
const demo = classTokens(walk(join(uiRoot, 'demo')))
const styled = styledBlocks()

const problems: string[] = []

// 1. 组件用了但没有规则的 block —— 按需引入之后就是"裸组件"
const componentBlocks = new Map<string, string>()
for (const [token, where] of components.tokens) {
  const block = blockOf(token)
  if (!componentBlocks.has(block)) componentBlocks.set(block, where)
}
for (const [block, where] of componentBlocks) {
  if (styled.has(block)) continue
  if (STRUCTURAL_HOOKS[block] !== undefined) continue
  const hook = Object.entries(STRUCTURAL_HOOKS).find(([name]) => blockOf(name) === block)
  if (hook) continue
  problems.push(`${where} 的 .${block} 在 src/style.css 里没有任何规则：按需引入后这个组件是裸的`)
}

// 2. 样式表里有规则却没人用的 block —— 死规则，通常来自重命名漏改
for (const block of styled) {
  const usedByComponent = [...components.tokens.keys()].some((token) => blockOf(token) === block)
  const usedByDemo = [...demo.tokens.keys()].some((token) => blockOf(token) === block)
  const declaredHook = Object.keys(STRUCTURAL_HOOKS).some((name) => blockOf(name) === block)
  if (usedByComponent || usedByDemo || declaredHook) continue
  problems.push(`src/style.css 的 .${block} 没有任何组件或 demo 在用：死规则，多半是重命名时漏改`)
}

if (problems.length > 0) {
  console.error('[styles] 组件样式门禁未通过：')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  `[styles] 通过 · ${componentBlocks.size} 个组件 block 全部有规则 · ` +
    `${styled.size} 个样式 block 全部有使用者 · ${Object.keys(STRUCTURAL_HOOKS).length} 个结构钩子已登记`,
)
