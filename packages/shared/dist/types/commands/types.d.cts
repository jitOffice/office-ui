/**
 * 命令系统的公开类型（03 §1）。
 *
 * 这一层刻意不 import vue：命令注册表是全库唯一的事实源，宿主可能是 Vue、
 * 可能是 jQuery 老页面、可能是 Node 里的协同服务端。一旦这里出现 Vue，
 * 三者就只有一个能用。
 */
export type OjMessageParam = string | number;
export interface OjIntlMessage {
    key: string;
    params?: Record<string, OjMessageParam>;
}
/** 可以是裸文案，也可以是 i18n 引用；注册表通过 `resolve()` 统一成字符串。 */
export type OjMessage = string | OjIntlMessage;
/** `mod` 由快捷键层按平台展开（Win/Linux = Ctrl，Mac = Cmd），注册表不解释。 */
export type OjKeyBinding = string;
export type OjHistoryMode = 'undoable' | 'transient' | 'none';
export interface OjCommandState {
    enabled?: boolean;
    active?: boolean;
    indeterminate?: boolean;
    value?: string | number;
    /** 运行时改文案，例如"接受所有修订" ↔ "接受此修订"。 */
    label?: string;
}
export interface OjCommand<C = unknown> {
    /** `namespace.action`，点分，全局唯一。 */
    id: string;
    label: OjMessage;
    description?: OjMessage;
    icon?: string;
    keys?: OjKeyBinding | OjKeyBinding[];
    group?: string;
    order?: number;
    /** 是否适用于当前上下文。为 false 时既不出现在菜单里，也不能被 run。 */
    when?: (context: C) => boolean;
    state?: (context: C) => OjCommandState;
    run: (context: C, arg?: unknown) => void | Promise<void>;
    /** 缺省视为 `undoable`：Office 里格式与内容类命令必须可撤销，漏写就是数据找回能力缺失。 */
    history?: OjHistoryMode;
}
export interface OjListQuery<C = unknown> {
    group?: string;
    context?: C;
    /** 默认 false，即已按 `when` 过滤。 */
    includeUnavailable?: boolean;
}
export type OjRunSkip = 'not-found' | 'when' | 'disabled';
export interface OjRunResult {
    id: string;
    ok: boolean;
    /** 被注册表挡下时给出的原因；`ok === true` 时为 undefined。 */
    skipped?: OjRunSkip;
    /** `run` 自身抛错时原样带回，注册表不吞异常也不改写。 */
    error?: unknown;
}
/**
 * 宿主的状态源。只要能"通知发生了变化"就够了，不要求任何框架身份：
 * Vue 的 `watch`、Redux store、PostMsg、甚至一个手写的事件总线都满足。
 */
export interface OjReactiveSource {
    subscribe(listener: () => void): () => void;
}
/**
 * 撤销栈适配器。注册表不知道引擎怎么做事务，只负责把命令分派到正确的档位：
 * 只有 `undoable` 进 `transact`，`none` 两处都不进。
 */
export interface OjHistoryAdapter {
    transact(label: string, invoke: () => unknown): unknown;
    recordRecent?(label: string): void;
}
export interface OjCommandRegistryOptions<C = unknown> {
    /** 每次求值时取当前上下文；不传视为单一常量上下文。 */
    context?: () => C;
    /** i18n 解析。缺省实现只取 `IntlMessage.key`，保证零依赖时可运行。 */
    resolve?: (message: OjMessage) => string;
    history?: OjHistoryAdapter;
    /** 合帧调度器。缺省 rAF，无 rAF 时退到 setTimeout，测试可注入同步调度器。 */
    schedule?: (task: () => void) => void;
    /** dev 模式下重复注册同一 id 会告警；生产模式静默覆盖。 */
    dev?: boolean;
    onError?: (error: unknown, id: string) => void;
}
export type OjStateListener = (state: OjCommandState, previous: OjCommandState | undefined) => void;
/**
 * 注册表本体。生命周期方法都返回"撤销函数"，因为 Ribbon/Toolbar 一类组件
 * 会在 setup 里注册、在 unmount 时注销，回调式 API 是唯一能同时喂给 Vue effect
 * scope 和 jQuery 插件生命周期而不泄漏的形态。
 */
export interface OjCommandRegistry<C = unknown> {
    /** 返回注销函数。重复注册同一 id：dev 告警、prod 静默覆盖。 */
    register(command: OjCommand<C>): () => void;
    unregister(id: string): boolean;
    get(id: string): OjCommand<C> | undefined;
    /** 按 `order`（同值按注册次序）排序，默认已过滤掉 `when` 不通过的命令。 */
    list(query?: OjListQuery<C>): OjCommand<C>[];
    /** 记忆化取值；未注册返回 undefined，无 `state` 的命令返回 `{ enabled: true }`。 */
    state(id: string): OjCommandState | undefined;
    /** 不 rethrow：结果里的 `skipped` / `error` 说明为什么什么都没发生。 */
    run(id: string, arg?: unknown): Promise<OjRunResult>;
    /** 挂接宿主的状态源，返回解绑函数。通知会被合帧，一帧内多次通知只重算一轮。 */
    bind(source: OjReactiveSource): () => void;
    /** 手动宣告"外部状态变了"。给不出响应式源的宿主用它轮询，但这是退路不是正路。 */
    refresh(): void;
    subscribe(id: string, listener: OjStateListener): () => void;
    /** 把 `label` / `description` 解析成当前语言文案。 */
    resolve(message: OjMessage): string;
    dispose(): void;
}
