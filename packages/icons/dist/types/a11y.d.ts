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
    label?: string | undefined;
    decorative?: boolean | undefined;
}
export declare function iconLabelProblem(name: string, options?: IconA11yOptions): string | undefined;
/** 只有构建器**明确**说是 dev 才告警：宁可线上漏报，也不要在产物里刷控制台。 */
export declare function isDevEnv(env: {
    DEV?: boolean;
} | undefined): boolean;
