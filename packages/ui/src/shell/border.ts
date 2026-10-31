/**
 * 边框模型（03 §3 / M2 `OjBorderPicker`）。
 *
 * 三个维度（线型 / 线宽 / 颜色）必须一起归一，否则会出现"选了无边框，但颜色还高亮着"的界面：
 * `none` 时宽度与颜色在语义上不存在，归一化后要显式表达这一点（`width: 0`）。
 *
 * 线宽是 **px 数值**而不是枚举字符串：文档格式存的是数值，组件只是提供几个常用档位。
 */

import { isCssColor } from './color.ts'

export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double'

export interface BorderValue {
  readonly style: BorderStyle
  readonly width: number
  readonly color: string
}

export const BORDER_STYLES: readonly BorderStyle[] = ['none', 'solid', 'dashed', 'dotted', 'double']

/** Word 的常用线宽档（pt 换算后的近似值），含 0.5 这种细线。 */
export const BORDER_WIDTHS: readonly number[] = [0.5, 0.75, 1, 1.5, 2, 3]

export const BORDER_COLORS: readonly string[] = [
  'var(--oj-text-1)',
  'var(--oj-text-3)',
  'var(--oj-border-3)',
  'var(--oj-brand-6)',
  'var(--oj-text-danger)',
]

export const DEFAULT_BORDER: BorderValue = { style: 'solid', width: 1, color: 'var(--oj-text-1)' }

export const BORDER_WIDTH_RANGE = { min: 0, max: 12 } as const

function isStyle(value: unknown): value is BorderStyle {
  return typeof value === 'string' && (BORDER_STYLES as readonly string[]).includes(value)
}

/**
 * 归一化三个维度。
 *
 * 规则：
 *   - `style: 'none'` 时宽度归 0（语义上"没有线"，留着 1px 会让下游导出工具画出细线）；
 *   - 宽度夹进 `[0, 12]` 并保留两位小数（0.75 这类值是合法档位）；
 *   - 颜色不合法就回退默认色，而不是保留一个渲染不出来的字符串。
 */
export function normalizeBorder(value: Partial<BorderValue> | undefined): BorderValue {
  const style: BorderStyle = isStyle(value?.style) ? value.style : DEFAULT_BORDER.style
  const rawWidth = typeof value?.width === 'number' && Number.isFinite(value.width) ? value.width : DEFAULT_BORDER.width
  const clamped = Math.min(Math.max(rawWidth, BORDER_WIDTH_RANGE.min), BORDER_WIDTH_RANGE.max)
  const color = typeof value?.color === 'string' && isCssColor(value.color) ? value.color : DEFAULT_BORDER.color
  if (style === 'none') return { style, width: 0, color }
  return { style, width: Number(clamped.toFixed(2)), color }
}

/**
 * 生成 CSS 值，供预览块与"应用到选区"两条路共用（两套字符串迟早会不一致）。
 * 入参收 `Partial`：预览时经常只想换一个维度（`{ ...current, style: 'none' }`），
 * 内部统一走 `normalizeBorder`，调用方不必先自己补齐三个字段。
 */
export function borderCss(value: Partial<BorderValue> | undefined): string {
  const normalized = normalizeBorder(value)
  if (normalized.style === 'none') return 'none'
  return `${normalized.width}px ${normalized.style} ${normalized.color}`
}

/** 线宽档位文案：`1` 而不是 `1.00`。 */
export function formatBorderWidth(width: number): string {
  return String(Number(width.toFixed(2)))
}
