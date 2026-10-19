/**
 * 编辑器宿主。组件库不持有文档模型，只通过这四个方法读写内核。
 *
 * `subscribe` 与 `@jitoffice/shared` 的 `OjReactiveSource` 同形，注册表可以直接 `bind(host)`。
 * `state` 单独存在，是因为加粗这类命令要同时表达 `enabled` 与 `active`，`can()` 只够回答能不能执行。
 */
export interface OjEditorState {
    enabled?: boolean;
    active?: boolean;
    indeterminate?: boolean;
    value?: string | number;
    label?: string;
}
export interface OjEditorHost {
    can(id: string): boolean;
    exec(id: string, arg?: unknown): boolean;
    state(id: string): OjEditorState;
    subscribe(listener: () => void): () => void;
}
export interface EditorCall {
    id: string;
    arg: unknown;
}
export interface MemoryEditor {
    readonly host: OjEditorHost;
    readonly calls: readonly EditorCall[];
    /** 覆写某条命令的当前态，并通知订阅者。 */
    set(id: string, patch: OjEditorState): void;
}
/**
 * 测试与 demo 用的内存宿主。`format.*` 被执行时翻转 `active`，用来证明按钮能跟上选区。
 */
export declare function createMemoryEditor(initial?: Record<string, OjEditorState>): MemoryEditor;
