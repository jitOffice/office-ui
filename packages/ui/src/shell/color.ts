/**
 * 颜色模型（03 §3 / M2 `OjColorPicker`）。
 *
 * 色板里存的**不是十六进制**，而是 `var(--oj-brand-6)` 这类 token 引用：
 * 选色最终写到文档里的是 token，主题切换与暗色档位才会跟着变。
 * 只有"自定义颜色"那一栏才收真实色值——那里用户要的就是 `#3366ff` 本身。
 *
 * `normalizeHex` 做三件事：补 `#`、3 位展开成 6 位、统一小写。
 * 不做"rgb() → hex"的转换：接受两种写法再归一，会让"输入框里的值"和"文档里存的值"
 * 出现两种表示，diff 时看不出谁改了。
 */

export interface ColorSwatchGroup {
  readonly id: string
  /** 组内样本；值是 CSS 颜色（token 引用或十六进制）。 */
  readonly values: readonly string[]
}

/**
 * 默认色板：品牌十阶 + 一组中性色。
 *
 * 只取 3~9 阶：1/2 阶在白底上几乎看不见，10 阶是深色文字色，
 * 做"填充色"都会让用户以为没生效。
 */
export const COLOR_SWATCH_GROUPS: readonly ColorSwatchGroup[] = [
  {
    id: 'brand',
    values: [
      'var(--oj-brand-3)',
      'var(--oj-brand-4)',
      'var(--oj-brand-5)',
      'var(--oj-brand-6)',
      'var(--oj-brand-7)',
      'var(--oj-brand-8)',
      'var(--oj-brand-9)',
    ],
  },
  {
    id: 'neutral',
    values: ['#000000', '#404040', '#808080', '#bfbfbf', '#e5e6eb', '#ffffff', 'transparent'],
  },
]

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * 归一化十六进制颜色。返回 `#rrggbb`（小写）或 `undefined`。
 * 带 alpha 的 8 位写法（`#rrggbbaa`）刻意不收：文档格式里 alpha 是独立属性，
 * 混进颜色值会让"透明度"出现两种来源。
 */
export function normalizeHex(input: string): string | undefined {
  const match = HEX.exec(input.trim())
  if (match === null) return undefined
  const body = match[1]!.toLowerCase()
  if (body.length === 3) {
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`
  }
  return `#${body}`
}

/** 是否是一个组件能渲染的颜色值：token 引用、十六进制、`transparent`、`rgb()/hsl()`。 */
export function isCssColor(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  if (trimmed === 'transparent' || trimmed === 'currentColor') return true
  if (normalizeHex(trimmed) !== undefined) return true
  if (/^var\(--oj-[a-z0-9-]+\)$/.test(trimmed)) return true
  return /^(?:rgb|hsl)a?\([^()]*\)$/.test(trimmed)
}

/**
 * 色板里"最近的颜色"——给键盘左右移动用（不是给取色用）。
 * 只在 `values` 里找，找不到返回 `undefined`（调用方保留当前值）。
 */
export function neighborSwatch(values: readonly string[], current: string, direction: 1 | -1): string | undefined {
  if (values.length === 0) return undefined
  const index = values.indexOf(current)
  if (index === -1) return values[0]
  const next = index + direction
  if (next < 0 || next >= values.length) return undefined
  return values[next]
}
