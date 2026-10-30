/**
 * `@jitoffice/shared` 根入口：**只导出框架无关的运行时**。
 *
 * Vue 组合式函数（usePopper / usePortal / useHotkey…）走 `@jitoffice/shared/vue`
 * 子路径，不进根入口。理由很实际：jQuery / UMD / Node 三类宿主都可能只 install 这个包，
 * 根入口一旦 import vue，"零框架成本"这条卖点当场作废，而且 tree-shaking 也摇不掉
 * 一个模块级 import。
 */
export * from './commands/index.cjs';
