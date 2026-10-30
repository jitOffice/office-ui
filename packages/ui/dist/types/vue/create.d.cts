import type { OjLocaleRuntime } from './locale.cjs';
/**
 * 命令式 API（02 §4.2）：给 jQuery 用户一个"给我 DOM 节点，我渲染到它旁边"的入口，
 * 不需要懂 `createApp`。UMD 上就是 `OfficeUI.create('oj-table-grid-picker', {…})`。
 *
 * **这里最容易被忽略的坑是 provide/inject**：每个 `create` 是独立 app，
 * 拿不到页面里 `OjLocaleProvider` 提供的语言上下文——症状是"页面是日文，
 * 命令式创建的弹层里文案是中文"。所以有了 `configure({ i18n })`：
 * 宿主在启动时登记一次，之后所有 `create` / `hydrate` 出来的实例都自动套上同一个 i18n。
 */
export interface OjConfigureOptions {
    /** 与页面上 `OjLocaleProvider` 用的同一个 `createI18n()` 实例 */
    i18n?: OjLocaleRuntime;
    /** 写入挂载容器的 `data-oj-theme`。当前 token 的主题选择器是 `html.dark`，元素级覆盖尚未支持 */
    theme?: 'light' | 'dark';
    /** 写入挂载容器的 `data-oj-density`，同上 */
    density?: 'comfortable' | 'compact';
}
export interface OjCreateOptions extends OjConfigureOptions {
    /** 挂载位置。可以是选择器、元素，或省略（挂到 `<body>`）。实例会插在这个元素**之后** */
    anchor?: string | Element;
    props?: Record<string, unknown>;
    /** 事件名 → 回调。`select` 会被转成 `onSelect` 传给组件 */
    on?: Record<string, (...args: unknown[]) => void>;
}
export interface OjInstance {
    readonly el: Element;
    readonly name: string;
    /** 受控更新：浅合并到当前 props */
    setProps(next: Record<string, unknown>): void;
    /** 必须显式调用，否则 app 与 DOM 都留着（02 §4.2 原文） */
    destroy(): void;
}
export declare function configure(options: OjConfigureOptions): void;
/** 只给测试用：清掉全局默认，避免用例之间互相污染 */
export declare function resetConfigure(): void;
export declare function create(name: string, options?: OjCreateOptions): OjInstance;
