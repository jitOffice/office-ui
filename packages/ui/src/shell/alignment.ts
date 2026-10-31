/**
 * 对齐模型（03 §3 / M2 `OjAlignmentPicker`）。
 *
 * 水平与垂直**分开建模**，不合并成一个 9 宫格枚举：Office 里"两端对齐 + 垂直居中"是常见组合，
 * 用 9 个枚举值表示会漏掉 4 种（两端对齐在垂直方向没有意义，但组合表会逼你给它编一个）。
 *
 * `justify`（两端对齐）只存在于水平方向——这是排版语义，不是实现偷懒。
 */

export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify'
export type VerticalAlign = 'top' | 'middle' | 'bottom'

export interface AlignmentValue {
  readonly horizontal: HorizontalAlign
  readonly vertical: VerticalAlign
}

export const HORIZONTAL_ALIGNS: readonly HorizontalAlign[] = ['left', 'center', 'right', 'justify']
export const VERTICAL_ALIGNS: readonly VerticalAlign[] = ['top', 'middle', 'bottom']

/** 默认值：左对齐 + 顶端对齐，与 Office 新建文档一致。 */
export const DEFAULT_ALIGNMENT: AlignmentValue = { horizontal: 'left', vertical: 'top' }

function isHorizontal(value: unknown): value is HorizontalAlign {
  return typeof value === 'string' && (HORIZONTAL_ALIGNS as readonly string[]).includes(value)
}

function isVertical(value: unknown): value is VerticalAlign {
  return typeof value === 'string' && (VERTICAL_ALIGNS as readonly string[]).includes(value)
}

export function isAlignmentValue(value: unknown): value is AlignmentValue {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<AlignmentValue>
  return isHorizontal(candidate.horizontal) && isVertical(candidate.vertical)
}

/**
 * 归一化：任一方向不合法就回退到默认值，而不是保留半边。
 * 半边合法会让界面出现"水平高亮在右、垂直一个都没高亮"的状态。
 */
export function normalizeAlignment(value: Partial<AlignmentValue> | undefined): AlignmentValue {
  if (value === undefined) return DEFAULT_ALIGNMENT
  return {
    horizontal: isHorizontal(value.horizontal) ? value.horizontal : DEFAULT_ALIGNMENT.horizontal,
    vertical: isVertical(value.vertical) ? value.vertical : DEFAULT_ALIGNMENT.vertical,
  }
}

/** 在水平方向循环（方向键左右用）。两端不环绕：环绕会让"按到底"变成"回到另一头"。 */
export function stepHorizontal(value: HorizontalAlign, direction: 1 | -1): HorizontalAlign {
  const index = HORIZONTAL_ALIGNS.indexOf(value)
  const next = HORIZONTAL_ALIGNS[index + direction]
  return next ?? value
}

export function stepVertical(value: VerticalAlign, direction: 1 | -1): VerticalAlign {
  const index = VERTICAL_ALIGNS.indexOf(value)
  const next = VERTICAL_ALIGNS[index + direction]
  return next ?? value
}

/** 预览用的 CSS `text-align`。`justify` 原样透出，浏览器认它。 */
export function textAlignCss(horizontal: HorizontalAlign): string {
  return horizontal === 'justify' ? 'justify' : horizontal
}

/** 预览用的 CSS `vertical-align`：`middle` 在表格单元格里要写成 `middle`，不是 `center`。 */
export function verticalAlignCss(vertical: VerticalAlign): string {
  return vertical === 'middle' ? 'middle' : vertical
}
