/**
 * 运行时图标注册表（05 C1 的余项）——业务图标不再需要 fork 一套自己的渲染。
 *
 * 内置的三十枚在 `icons.ts` 里是常量；业务侧（客户 logo、行业符号、内部状态图标）以前只能
 * 自己写 `v-html`，于是无障碍、尺寸、`currentColor` 继承全丢。这里给一个受校验的注册入口，
 * `OjIcon` 的查表顺序是**注册表优先**。
 *
 * 三条硬规矩，都是"注册期失败好过渲染期空白"：
 *   1. `oj-` 前缀归内置：允许业务覆盖 `oj-close` 会让同一份代码在不同应用里长得不一样，
 *      排查时报错截图跟源码对不上；
 *   2. markup 必须是**单个 `<svg>` 且带 `viewBox`**：没有 viewBox 的 SVG 在 flex 容器里会被
 *      压成 0 尺寸，那种"图标不显示"最容易被误判成打包问题；
 *   3. 拒绝 `on*=` 内联事件、`javascript:`、`<script>`、`<foreignObject>`、外链 `href`/`<image>`。
 *      组件是用 `innerHTML` 渲染的，业务图标的字符串常常来自图标包或后端，不做这层检查
 *      等于把注入面直接开给调用方；外链还会在内网环境挂住首屏（与 lint:artifact-offline 同理）。
 *
 * 重复注册同名图标是**允许覆盖**的：主题切换、微前端按需替换都靠它，幂等比"注册时报冲突"有用。
 */
export type IconMarkup = string;
/**
 * 校验一份图标 markup。返回 `undefined` 表示可用；否则返回给人看的问题描述。
 * 独立导出是为了让它能在零依赖的 `node --test` 里被逐条断言（不加载 vue）。
 */
export declare function iconMarkupProblem(name: string, markup: string): string | undefined;
/** 注册单枚图标。同名覆盖（主题/微前端替换用）。 */
export declare function registerIcon(name: string, markup: IconMarkup): void;
/** 批量注册。**先整体校验再写入**：一条不合格时不留半套注册结果。 */
export declare function registerIcons(table: Readonly<Record<string, IconMarkup>>): void;
/** 注销。返回是否真的删掉了（重复注销不该当成错误）。 */
export declare function unregisterIcon(name: string): boolean;
/** 已注册的业务图标名（不含内置的三十枚）。 */
export declare function registeredIconNames(): string[];
/** 清空。测试与"整站换一套图标"用。 */
export declare function resetRegisteredIcons(): void;
export declare function registeredIconMarkup(name: string): IconMarkup | undefined;
