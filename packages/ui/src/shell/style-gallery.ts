/**
 * 样式画廊的预设（03 §3 / M2 `OjStyleGallery`）。
 *
 * 每一项都直接映射到 token，而不是写死字号/字重：
 * 样式画廊的意义是"同一份内容换一种排版"，如果预览用写死的 18px，`compact` 档位下
 * 预览和正文会一起失真，用户看到的是假样式。
 *
 * 内置预设只覆盖段落级样式（标题 1/2/3、正文、引用、代码），句子级（加粗/斜体/下划线）
 * 归工具条的按钮，不进画廊——两处都能改同一件事时，用户会怀疑它们不同步。
 */

export interface StylePreset {
  readonly id: string
  /** 显示名由使用方给（语言相关），这里只留 id 与样式参数。 */
  readonly fontSize: number
  readonly bold?: boolean
  readonly italic?: boolean
  readonly family?: 'sans' | 'mono' | 'doc'
}

export const STYLE_PRESETS: readonly StylePreset[] = [
  { id: 'title-1', fontSize: 32, bold: true },
  { id: 'title-2', fontSize: 24, bold: true },
  { id: 'title-3', fontSize: 20, bold: true },
  { id: 'body', fontSize: 14 },
  { id: 'quote', fontSize: 14, italic: true, family: 'doc' },
  { id: 'code', fontSize: 14, family: 'mono' },
]

/** 预览与"应用样式"共用的一份内联样式，避免两处各写一套。 */
export function stylePresetCss(preset: StylePreset): Record<string, string> {
  const css: Record<string, string> = { fontSize: `${preset.fontSize}px` }
  if (preset.bold === true) css.fontWeight = '600'
  if (preset.italic === true) css.fontStyle = 'italic'
  css.fontFamily = `var(--oj-font-${preset.family ?? 'sans'})`
  return css
}

/**
 * 显示名缺省时回退到 id。
 * 不在这里编中文名：`title-1` 在日文界面应该是"見出し1"，写死中文就永远翻不掉。
 */
export function styleLabel(labels: Readonly<Record<string, string>> | undefined, id: string): string {
  return labels?.[id] ?? id
}
