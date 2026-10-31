/**
 * 格式类命令的实参归一化（03 §3 / M2「格式相关命令端到端可用」）。
 *
 * 这一层存在的理由，是**选择器与命令之间必须只有一个口径**：`OjFontSizeField` 的上下限、
 * `OjBorderPicker` 的 CSS 拼法、`OjAlignmentPicker` 的双维度模型，各自都已有纯函数。
 * 如果命令各自再校验一遍，同一条规则就会出现两份，而两份规则的分歧只会在"用户手输了一个
 * 边界值"的时候才暴露。
 *
 * 所有归一化都遵循同一条不变式，它同时是测试的断言对象：
 *
 *   `host.exec(id, x)` 之后，`host.state(id).value === 归一化(x)`
 *
 * 也就是**传给宿主的实参，就是 `state().value` 能读回来的那个值**——`OjCommandState.value`
 * 只收 `string | number`，而边框/对齐是结构体，所以它们在这里被编码成字符串
 * （边框就是 CSS 简写，与预览块同一个函数；对齐是 `"center middle"`）。
 *
 * 不合法实参一律**抛错**，而不是静默回退默认值：`registry.run()` 会把异常原样带进结果，
 * 静默回退会让"选了一个不存在的颜色"看起来像成功。
 */

import type { AlignmentValue } from './shell/alignment.ts'
import { isAlignmentValue, textAlignCss, verticalAlignCss } from './shell/alignment.ts'
import type { BorderValue } from './shell/border.ts'
import { borderCss } from './shell/border.ts'
import { isCssColor } from './shell/color.ts'
import { FONT_SIZE_RANGE, LINE_SPACING_RANGE, formatFontSize, formatLineSpacing } from './shell/presets.ts'

/** 字体 id（如 `sans` / `doc`）。只校验"非空字符串"：自定义字体名也是合法值。 */
export function fontFamilyArg(arg: unknown): string {
  if (typeof arg !== 'string') throw new Error('format.fontFamily 需要字体 id 字符串')
  const id = arg.trim()
  if (id.length === 0) throw new Error('format.fontFamily 需要非空的字体 id')
  return id
}

/** 字号：与 `OjFontSizeField` 同一区间（1–999），保留一位小数。 */
export function fontSizeArg(arg: unknown): number {
  if (typeof arg !== 'number' || !Number.isFinite(arg)) throw new Error('format.fontSize 需要数字')
  if (arg < FONT_SIZE_RANGE.min || arg > FONT_SIZE_RANGE.max) {
    throw new Error(`format.fontSize 超出 ${FONT_SIZE_RANGE.min}–${FONT_SIZE_RANGE.max}`)
  }
  return Number(formatFontSize(arg))
}

/**
 * 文字颜色：`isCssColor` 认的四种写法（token 引用 / 十六进制 / `transparent` / `rgb()`）。
 * 存 token 引用而不是解析成十六进制，是 `shell/color.ts` 的既有决策：主题切换要跟着变。
 */
export function textColorArg(arg: unknown): string {
  if (typeof arg !== 'string') throw new Error('format.textColor 需要颜色字符串')
  const value = arg.trim()
  if (!isCssColor(value)) throw new Error(`format.textColor 不认识这个颜色：${value}`)
  return value
}

/**
 * 边框：收 `BorderValue`（可部分给出）或字符串 `'none'`，**输出 CSS 简写**。
 *
 * 输出与预览块共用 `borderCss()`，所以"预览里看到的线"与"应用到选区上的线"永远是同一串字符。
 * `'none'` 单独收，是因为 `OjBorderPicker` 的"无边框"按钮在语义上不是"宽 0 的实线"。
 */
export function borderArg(arg: unknown): string {
  if (arg === 'none') return 'none'
  if (typeof arg !== 'object' || arg === null) {
    throw new Error('format.border 需要 BorderValue 或 "none"')
  }
  return borderCss(arg as Partial<BorderValue>)
}

/** 行距：倍数（`1` / `1.15` / `1.5` / `2`），区间与 `OjLineSpacingPicker` 一致。 */
export function lineSpacingArg(arg: unknown): number {
  if (typeof arg !== 'number' || !Number.isFinite(arg)) throw new Error('format.lineSpacing 需要数字')
  if (arg < LINE_SPACING_RANGE.min || arg > LINE_SPACING_RANGE.max) {
    throw new Error(`format.lineSpacing 超出 ${LINE_SPACING_RANGE.min}–${LINE_SPACING_RANGE.max}`)
  }
  return Number(formatLineSpacing(arg))
}

/**
 * 对齐：收 `AlignmentValue`，编码成 `"center middle"`。
 *
 * 两个方向**一起**传，而不是拆成两条命令：Office 的"两端对齐 + 垂直居中"是一次操作，
 * 拆开会让一次点击产生两条撤销记录，而用户按一次 Ctrl+Z 只期望退回一步。
 */
export function alignArg(arg: unknown): string {
  if (!isAlignmentValue(arg)) throw new Error('format.align 需要 { horizontal, vertical }')
  return `${textAlignCss(arg.horizontal)} ${verticalAlignCss(arg.vertical)}`
}

/** `alignArg` 的逆运算。不认识的值返回 `undefined`（调用方保留当前对齐，不要猜）。 */
export function parseAlignValue(value: string | number | undefined): AlignmentValue | undefined {
  if (typeof value !== 'string') return undefined
  const [horizontal, vertical] = value.trim().split(/\s+/) as [string, string | undefined]
  if (vertical === undefined) return undefined
  const candidate = { horizontal, vertical }
  return isAlignmentValue(candidate) ? candidate : undefined
}
