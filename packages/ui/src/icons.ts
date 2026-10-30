/**
 * 自绘图标。只发 SVG 字符串，不发图标字体（prd/00 许可红线）。
 * 完整图标管线仍是后续的 `@jitoffice/icons`，这里先覆盖外壳会用到的三十枚。
 * 业务侧要加图标不要改这张表——用 `registerIcon`（见 `icon-registry.ts`），
 * 否则每次升级都会把改动冲掉。
 */

import { registeredIconMarkup } from './icon-registry.ts'

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
  'oj-format-italic': SVG_OPEN + '<path d="M6.2 2h6l-.4 1.6H9.7L7.4 12.4h2.1L9.1 14H3.2l.4-1.6h2.1L8 3.6H5.8L6.2 2z"/></svg>',
  'oj-format-underline':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">' +
    '<path d="M4 2.5v5.2a4 4 0 0 0 8 0V2.5M3 13.5h10"/></svg>',
  'oj-align-left':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z"/></svg>',
  'oj-align-center':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.4H2zm2 3.2h8v1.4H4zm-2 3.2h12v1.4H2zm2 3.2h8v1.4H4z"/></svg>',
  'oj-align-right':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z"/></svg>',
  'oj-list-bullet':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="4" r="1.1"/><circle cx="3" cy="8" r="1.1"/><circle cx="3" cy="12" r="1.1"/><path d="M6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z"/></svg>',
  'oj-list-number':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2.2 3.2h1.2V6H2.2zm0 3.6h2.2v.9H3.2v.5h1.2V9.6H2.2v-.9h1.2v-.4H2.2zm.2 3.2h1.6c.4 0 .7.2.7.6s-.3.6-.7.6H2.4v.9h2.2v.9H2.2v-2.1h.2zM6 3.3h8v1.4H6zm0 4h8v1.4H6zm0 4h8v1.4H6z"/></svg>',
  'oj-search':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.5 13.5"/></svg>',
  'oj-zoom-in':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.5 13.5M7 5v4M5 7h4"/></svg>',
  'oj-zoom-out':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13.5 13.5M5 7h4"/></svg>',
  'oj-folder':
    SVG_OPEN + '<path d="M2 4.2A1.2 1.2 0 0 1 3.2 3h3l1.2 1.4H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3.2A1.2 1.2 0 0 1 2 11.8z"/></svg>',
  'oj-file':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 2.2h5.2L12.5 5.5V13.8H4z"/><path d="M9.2 2.2V5.5H12.5"/></svg>',
  'oj-chevron-right':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
  'oj-chevron-down':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3.5 6 8 10.5 12.5 6"/></svg>',
  'oj-close':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  'oj-undo':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 7.5 1.8 5.2 4 3"/><path d="M2.2 5.2h6.2a4.2 4.2 0 1 1 0 8.4H6"/></svg>',
  'oj-image':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.2" y="3" width="11.6" height="10" rx="1"/><circle cx="5.5" cy="6.2" r="1"/><path d="M3 11.5 6.2 8.2l2 2 1.6-1.4L13 11.5"/></svg>',
  'oj-link':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7L7.6 4.7"/><path d="M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.7 8.6a2.6 2.6 0 0 0 3.7 3.7l1-1"/></svg>',
  'oj-comment':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 3.2h10v7.2H6.2L3 12.8z"/></svg>',
  'oj-print':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4.5 6V2.8h7V6"/><path d="M4 11.2H2.8V6.5h10.4v4.7H12"/><rect x="4.5" y="9" width="7" height="4.2"/></svg>',
  'oj-page':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3.5" y="2" width="9" height="12" rx="0.6"/></svg>',
  'oj-signature':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 11.5c1.6-2.4 2.4-2.2 3.2-.4.6 1.4 1.2 1.6 2-.2 1-2.2 1.6-2 2.6.2.6 1.4 1.4 1.6 2.4-.2"/><path d="M2 13.6h12"/></svg>',
  'oj-stamp':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="7" r="4.2"/><path d="M5.2 13.2h5.6M6.4 11.2h3.2"/></svg>',
  'oj-watermark':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1"/><path d="M4 11.2 12 4.8"/></svg>',
  'oj-ai':
    SVG_OPEN + '<path d="M8 1.8 9.2 6h4.3L10.3 8.6l1.1 4.2L8 10.4 4.6 12.8 5.7 8.6 2.5 6h4.3z"/></svg>',
  'oj-indent':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.4H2zm4 3.2h8v1.4H6zm-4 3.2h12v1.4H2zm4 3.2h8v1.4H6z"/></svg>',
  'oj-outdent':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v1.4H2zm0 3.2h8v1.4H2zm0 3.2h12v1.4H2zm0 3.2h8v1.4H2z"/></svg>',
  'oj-code':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 4.5 3 8l3 3.5M10 4.5 13 8l-3 3.5"/></svg>',
} as const

export type OjIconName = keyof typeof icons

export function iconMarkup(name: string): string | undefined {
  // 注册表优先：业务图标与内置图标同名是不可能的（`registerIcon` 拒绝 `oj-` 前缀），
  // 但把这一层写在前面能让"运行时替换"在读代码时一目了然。
  const registered = registeredIconMarkup(name)
  if (registered !== undefined) return registered
  if (Object.prototype.hasOwnProperty.call(icons, name)) return icons[name as OjIconName]
  return undefined
}

/**
 * 03 §2「可访问名」：纯图标元素对读屏用户等同于空白。
 *
 * 判定做成纯函数而不是在组件里直接 `console.warn`，因为它要能在零依赖的 `node --test`
 * 里被断言——那条链不加载 vue，组件层只负责在 dev 下调一次。
 *
 * 为什么还要 `decorative`：`<button aria-label="关闭"><OjIcon name="oj-close" /></button>`
 * 里的图标是**装饰**，正确做法就是 `aria-hidden`；硬逼它写 label 会让读屏念两遍。
 * 所以契约从"必须给 label"收紧成"必须声明意图"：给 label（有语义），或标 decorative。
 */
export interface IconNameOptions {
  // 显式带上 `| undefined`：仓库开了 `exactOptionalPropertyTypes`，
  // 否则把 Vue 的 `props.label`（`string | undefined`）直接传进来会编译失败。
  label?: string | undefined
  decorative?: boolean | undefined
}

export function iconLabelProblem(name: string, options: IconNameOptions = {}): string | undefined {
  const labelled = typeof options.label === 'string' && options.label.length > 0
  if (labelled || options.decorative === true) return undefined
  return (
    `[OjIcon] "${name}" 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，` +
    `读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`
  )
}

/**
 * 只有构建器**明确**说是 dev 才告警。宁可线上漏报，也不要在产物里刷控制台——
 * 这个判定读的是 `import.meta.env.DEV`，Vite 在 dev server 下注入 true，产物里没有它。
 */
export function isDevEnv(env: { DEV?: boolean } | undefined): boolean {
  return env?.DEV === true
}
