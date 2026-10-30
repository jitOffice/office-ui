/**
 * 样式魔法数门禁（02 §7「组件 CSS 无字面色值」的另一半 / 05 A3 的 stylelint 项）。
 *
 * 契约 13 已经拦住了**颜色**字面量（`#fff` / `rgb()`）。这一条补**字号与时延**：
 * 02 §7 要求"颜色、字号、间距、时延一律取 token"，而这几项里只有颜色有门禁。
 * 后果可观测：`font-size: 12px` 写死后，`ja` 档位把 `--oj-fs-14` 降到 13px 时它不跟着降——
 * 日文界面下工具栏反而比中文大一号，而没人会去 diff 两份截图。
 *
 * 为什么不用 stylelint：本仓门禁的硬约束是**没有 `node_modules` 也要能跑**（CONTRIBUTING §0），
 * 而 stylelint 一装就是几十个传递依赖；这里要做的只是"值是不是 `var(--oj-fs-*)`"。
 *
 * **不查间距/圆角**：token 标度是 4/8/12/16/20/24/32/40 与 4/6/8/12/20/9999，覆盖不了样式表里
 * 真实存在的 2px / 7px / 28px / 56px。那要先定标度（设计决策）；硬塞进最近档位会静默改版式。
 * 这一条记在 05 的 A3 行里，别当成已过。
 *
 * 例外**逐条登记**：每条写清理由，且例外在样式表里消失后会被报出来（白名单腐烂比没有更糟）。
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const styleFile = join(repoRoot, 'packages', 'ui', 'src', 'style.css')

/** 允许的字面量 font-size，按选择器登记；三者都卡在 token 标度的两端。 */
const FONT_SIZE_EXCEPTIONS: Record<string, { value: string; reason: string }[]> = {
  '.oj-ruler': [
    { value: '10px', reason: '标尺刻度：读数要比正文小一档才能与 24px 尺身区分，token 最小档是 12px' },
  ],
  '.oj-watermark__layer': [{ value: '48px', reason: '水印文字：要横跨整页，token 最大档是 32px' }],
  '.oj-ribbon__keytip': [{ value: '11px', reason: 'Key Tip 字母牌：16px 方框内单字符的最大可读字号（03 §5）' }],
}

/** 同一个值出现在别处就是漏网之鱼：例外按选择器绑定，不做全局放行。 */
const exceptionValues = new Set(
  Object.values(FONT_SIZE_EXCEPTIONS).flatMap((entries) => entries.map((entry) => entry.value)),
)

type Rule = { selector: string; body: string; line: number }

/** 够用的规则切分：选择器不带 `{}`、声明块不带 `{`；`@media` 里的内层块照样能切出来。 */
function rules(source: string): Rule[] {
  // 注释替换成等长空格，行号才不会漂
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
  const out: Rule[] = []
  for (const match of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (match[1] as string).trim().replace(/\s+/g, ' ')
    if (selector.startsWith('@')) continue
    const index = match.index ?? 0
    out.push({ selector, body: match[2] as string, line: stripped.slice(0, index).split('\n').length })
  }
  return out
}

const parsed = rules(readFileSync(styleFile, 'utf8'))
const problems: string[] = []
const seen = new Set<string>()

/** `transition: color 150ms ease` / `animation: spin 0.3s linear` 里的时延。 */
const DURATION = /(^|[\s,(])(\d+(?:\.\d+)?)(ms|s)(?=[\s,)]|$)/

for (const rule of parsed) {
  let offset = 0
  for (const declaration of rule.body.split(';')) {
    const line = rule.line + rule.body.slice(0, offset).split('\n').length - 1
    offset += declaration.length + 1
    const colon = declaration.indexOf(':')
    if (colon === -1) continue

    const property = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (value.length === 0) continue

    if (property === 'font-size') {
      if (value.startsWith('var(--oj-fs-')) continue
      if (FONT_SIZE_EXCEPTIONS[rule.selector]?.some((entry) => entry.value === value)) {
        seen.add(`${rule.selector}|${value}`)
        continue
      }
      const hint = exceptionValues.has(value) ? '（这个值为别的选择器登记过，别顺手抄过来）' : ''
      problems.push(
        `style.css:${line} ${rule.selector} 的 font-size: ${value} 没用 --oj-fs-* token${hint}` +
          `：写死后 ja / compact 档位调字号时这一处不跟着变`,
      )
      continue
    }

    // 时延：`transition` / `animation` 及其 `-duration` 变体。`0s` 是关动效，不算魔法数。
    if (/^(transition|animation)(-duration)?$/.test(property)) {
      const duration = DURATION.exec(value)
      if (duration === null || duration[2] === '0') continue
      if (value.includes('var(--oj-motion-')) continue
      problems.push(
        `style.css:${line} ${rule.selector} 的 ${property} 里写死了 ${duration[2]}${duration[3]}` +
          `：时延要走 --oj-motion-duration-*，否则"减少动态效果"与密度档位都改不动它`,
      )
    }
  }
}

// 例外腐烂检查：登记了却没人用的例外必须删掉，否则下一个人会照着抄
for (const [selector, entries] of Object.entries(FONT_SIZE_EXCEPTIONS)) {
  for (const entry of entries) {
    if (seen.has(`${selector}|${entry.value}`)) continue
    problems.push(
      `例外表里的 ${selector} { font-size: ${entry.value} } 在样式表里已经不存在了：` +
        `删掉这条登记（当初的理由：${entry.reason}）`,
    )
  }
}

if (problems.length > 0) {
  console.error(`[css-magic] ${problems.length} 处未走 token：`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

const exceptionCount = Object.values(FONT_SIZE_EXCEPTIONS).flat().length
console.log(
  `[css-magic] 通过 · ${parsed.length} 条规则：font-size 全部走 --oj-fs-*、时延全部走 --oj-motion-*` +
    `（${exceptionCount} 条逐条登记的例外）`,
)
