/**
 * 图标可访问名判定（prd/03 §2）。
 *
 * 纯函数、零依赖：这条判定必须能在 `pnpm verify` 的零依赖链里被断言，
 * 而那条链不加载 vue，所以它不能长在组件里。
 *
 * 契约是"**必须声明意图**"而不是"必须给 label"：`<button aria-label="关闭"><OjIconClose/></button>`
 * 里的图标是装饰，正确做法就是 `aria-hidden`；硬逼它写 label 会让读屏念两遍。
 */

export interface IconA11yOptions {
  // 显式 `| undefined`：仓库开了 `exactOptionalPropertyTypes`，Vue 的 props 就是 `string | undefined`。
  label?: string | undefined
  decorative?: boolean | undefined
}

export function iconLabelProblem(name: string, options: IconA11yOptions = {}): string | undefined {
  const labelled = typeof options.label === 'string' && options.label.length > 0
  if (labelled || options.decorative === true) return undefined
  return (
    `[${name}] 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，` +
    `读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`
  )
}

/** 只有构建器**明确**说是 dev 才告警：宁可线上漏报，也不要在产物里刷控制台。 */
export function isDevEnv(env: { DEV?: boolean } | undefined): boolean {
  return env?.DEV === true
}
