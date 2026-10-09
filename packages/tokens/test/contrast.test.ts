/**
 * WCAG AA 对比度门禁。
 *
 * 这条测试会改变设计，不是装饰性检查。实测下来有一个必须承认的硬约束：
 *
 *   **在白底上做出 4 级可辨识的灰阶文本、且每级都达到 4.5:1，做不到。**
 *   实测次文本 #6C6F7D 是 4.99:1，要再浅一点还要保持 ≥4.5:1，
 *   亮度区间只剩 0.160 → 0.183，肉眼分不出两级占位与正文的差别。
 *
 * 因此本库按 WCAG 自己的分级来定策略，而不是笼统宣布"全部 AA"：
 *
 *   - text.1 / text.2 / text.3 与语义文字色：**AA 4.5:1**（承载信息的正文）
 *   - text.4 占位符：**3.0:1**。占位符不承载独有信息（label 与已填值都在），
 *     且输入即消失。实测值 #9A9CA6 只有 2.73:1，连这条底线都不过，已加深为 #8A8C96（3.35:1）；
 *     需要严格 AA 的场景，文档明确要求改用 text.3。
 *   - text.5 禁用态：**不设数值门槛**。WCAG 1.4.3 明确豁免 inactive controls；
 *     对它只要求结构不变量——对比度必须严格低于 text.4，保证灰阶次序不反转。
 *
 * 偏离实测基线的地方都写在 token 的 note 里，可追溯。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { contrastRatio, formatRatio } from '../src/color.ts'
import { buildRawMap, resolveMap, type ResolvedMap } from '../src/resolve.ts'
import { entries } from '../src/tokens.ts'

const AA = 4.5
const PLACEHOLDER = 3.0

function tokens(theme: 'light' | 'dark', density: 'comfortable' | 'compact' = 'comfortable'): ResolvedMap {
  return resolveMap(buildRawMap(theme, density))
}

/** 取 hex。rgba() 类 token 不参与本门禁 —— 玻璃底的合成对比由视觉回归负责。 */
function hex(t: ResolvedMap, name: string): string {
  const v = t[name]
  assert.ok(v, `缺少 token ${name}`)
  assert.match(v as string, /^#[0-9A-F]{6}$/, `${name} 不是六色值，无法算对比度：${v}`)
  return v as string
}

type Pair = [text: string, on: string]

const AA_PAIRS: Record<'light' | 'dark', Pair[]> = {
  light: [
    ['--oj-text-1', '--oj-bg-container'],
    ['--oj-text-1', '--oj-bg-page'],
    ['--oj-text-1', '--oj-bg-hover'],
    ['--oj-text-2', '--oj-bg-container'],
    ['--oj-text-2', '--oj-bg-page'],
    ['--oj-text-3', '--oj-bg-container'],
    ['--oj-text-3', '--oj-bg-page'],
    ['--oj-text-brand', '--oj-bg-container'],
    ['--oj-text-link', '--oj-bg-container'],
    ['--oj-text-success', '--oj-bg-container'],
    ['--oj-text-warning', '--oj-bg-container'],
    ['--oj-text-danger', '--oj-bg-container'],
    ['--oj-text-inverse', '--oj-bg-brand'],
  ],
  dark: [
    ['--oj-text-1', '--oj-bg-container'],
    ['--oj-text-1', '--oj-bg-page'],
    ['--oj-text-2', '--oj-bg-container'],
    ['--oj-text-3', '--oj-bg-container'],
    ['--oj-text-3', '--oj-bg-page'],
    ['--oj-text-brand', '--oj-bg-container'],
    ['--oj-text-link', '--oj-bg-container'],
    ['--oj-text-success', '--oj-bg-container'],
    ['--oj-text-warning', '--oj-bg-container'],
    ['--oj-text-danger', '--oj-bg-container'],
    ['--oj-text-danger', '--oj-bg-page'],
    ['--oj-text-inverse', '--oj-bg-brand'],
  ],
}

const PLACEHOLDER_PAIRS: Pair[] = [
  ['--oj-text-4', '--oj-bg-container'],
  ['--oj-text-4', '--oj-bg-elevated'],
]

function failures(theme: 'light' | 'dark', pairs: Pair[], min: number): string[] {
  const t = tokens(theme)
  const out: string[] = []
  for (const [textName, onName] of pairs) {
    const ratio = contrastRatio(hex(t, textName), hex(t, onName))
    if (ratio < min) {
      out.push(
        `${theme}: ${textName} ${hex(t, textName)} on ${onName} ${hex(t, onName)} = ${formatRatio(ratio)}，要求 ≥ ${min}:1`,
      )
    }
  }
  return out
}

test('亮色主题：正文级文本全部达到 AA 4.5:1', () => {
  assert.deepEqual(failures('light', AA_PAIRS.light, AA), [])
})

test('暗色主题：正文级文本全部达到 AA 4.5:1', () => {
  assert.deepEqual(failures('dark', AA_PAIRS.dark, AA), [])
})

test('占位符达到 3:1（本库对 text.4 的显式承诺，严格 AA 场景须改用 text.3）', () => {
  for (const theme of ['light', 'dark'] as const) {
    assert.deepEqual(failures(theme, PLACEHOLDER_PAIRS, PLACEHOLDER), [])
  }
})

test('灰阶次序：对比度必须随层级严格递减，禁用态不得比占位符更醒目', () => {
  for (const theme of ['light', 'dark'] as const) {
    const t = tokens(theme)
    const on = hex(t, '--oj-bg-container')
    const ladder = ['--oj-text-1', '--oj-text-2', '--oj-text-3', '--oj-text-4', '--oj-text-5'].map((name) =>
      contrastRatio(hex(t, name), on),
    )
    for (let i = 1; i < ladder.length; i++) {
      assert.ok(
        (ladder[i - 1] as number) > (ladder[i] as number),
        `${theme}: text.${i + 1} 的对比度没有低于 text.${i}，灰阶次序被打平`,
      )
    }
  }
})

test('紧凑密度不得改变任何颜色 token', () => {
  for (const theme of ['light', 'dark'] as const) {
    const base = tokens(theme)
    const compact = tokens(theme, 'compact')
    for (const name of Object.keys(base)) {
      if (/^(--oj-(text|bg|border|brand|gray|success|warning|danger|chart)-)/.test(name)) {
        assert.equal(compact[name], base[name], `${theme} 紧凑密度改变了颜色 token ${name}`)
      }
    }
  }
})

test('语言维度不得改变任何颜色 token', () => {
  for (const theme of ['light', 'dark'] as const) {
    const base = tokens(theme)
    for (const lang of ['zh-TW', 'ja'] as const) {
      const t = resolveMap(buildRawMap(theme, 'comfortable', lang))
      for (const name of Object.keys(base)) {
        if (/^(--oj-(text|bg|border|brand|gray|success|warning|danger)-)/.test(name)) {
          assert.equal(t[name], base[name], `${theme}/${lang} 改变了颜色 token ${name}`)
        }
      }
    }
  }
})

test('品牌色在容器底上至少可辨识（大字号与图标阈值 3:1）', () => {
  for (const theme of ['light', 'dark'] as const) {
    const t = tokens(theme)
    const ratio = contrastRatio(hex(t, '--oj-brand-6'), hex(t, '--oj-bg-container'))
    assert.ok(ratio >= 3, `${theme} brand-6 on container 仅 ${formatRatio(ratio)}`)
  }
})

/**
 * 结构性门禁，比配对表更早拦住问题：档位镜像只作用于 `var(--oj-*)` 引用。
 * 一个写成字面色（`#RRGGBB`）的文本 token 若不给 `dark`，暗色下会原样沿用亮色值，
 * 对比度直接落到 AA 以下，而且不会有任何报错——text.danger 曾踩过这个坑。
 */
test('写字面色就必须同时写暗色，镜像救不了字面引用', () => {
  const offenders = entries
    .filter((e) => /^#[0-9A-F]{6}$/.test(e.light) && e.dark === undefined)
    .map((e) => e.path)
  assert.deepEqual(offenders, [])
})
