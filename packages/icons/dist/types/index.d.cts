/**
 * `@jitoffice/icons` 根入口：框架无关。
 *
 * 这里只有常量与纯函数——canvas 消费方、Node 侧的文档站构建、无 DOM 的服务端都能安全导入。
 * Vue 组件在 `@jitoffice/icons/vue` 子路径（ADR-0005 的同一条理由：根入口一旦 import vue，
 * 零依赖那条链就断了）。
 */
export { iconMarkup, icons } from './generated/icons.cjs';
export type { OjIconName, OjIconSource } from './generated/icons.cjs';
export { iconLabelProblem, isDevEnv } from './a11y.cjs';
export type { IconA11yOptions } from './a11y.cjs';
