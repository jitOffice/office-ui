/**
 * E1 的三枚自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
 * 其余办公图标仍走后续的 `@jitoffice/icons` 构建管线，不在这一枚里凑数。
 */

const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">'

export const icons = {
  'oj-format-bold':
    SVG_OPEN +
    '<path d="M4 2h4.1A2.55 2.55 0 0 1 8.1 7.1H4V2zm0 5.1h4.7A2.65 2.65 0 0 1 8.7 14H4V7.1z"/></svg>',
  'oj-insert-table':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">' +
    '<rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1"/>' +
    '<path d="M2.2 6.4h11.6M2.2 10.2h11.6M6.4 2.2v11.6M10.2 2.2v11.6"/></svg>',
  'oj-horizontal-rule':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">' +
    '<path d="M2 8h12"/></svg>',
} as const

export type OjIconName = keyof typeof icons

export function iconMarkup(name: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(icons, name)) return icons[name as OjIconName]
  return undefined
}
