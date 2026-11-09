/**
 * 版本历史（03 §3 E 组 `OjVersionHistory`）。
 *
 * 两个容易做错的地方，都在这里定死：
 *   - **恢复必须走"确认"这一步**，而且确认是状态机而不是一个 `confirming: boolean`：
 *     点错行时布尔值只能表达"某处要恢复了"，说不清是哪一条，用户会更慌。
 *   - **排序与命名是纯数据操作**：把排序写在组件渲染里，重命名后列表顺序会跟着变，
 *     用户刚改完名字就找不到那一条。名字只是标签，时间才是顺序。
 */
export interface VersionEntry {
    readonly id: string;
    /** 毫秒时间戳。 */
    readonly at: number;
    readonly author: string;
    /** 用户起的名字（"定稿"）；没有就是自动版本。 */
    readonly name?: string;
    /** 预览摘要（首段、字数变化），由宿主生成。 */
    readonly summary?: string;
}
export type RestoreState = {
    readonly status: 'idle';
} | {
    readonly status: 'confirming';
    readonly entryId: string;
} | {
    readonly status: 'restoring';
    readonly entryId: string;
};
export declare const IDLE_RESTORE: RestoreState;
/** 新的在前；时间相同保持原有顺序（`Array.prototype.sort` 是稳定排序）。 */
export declare function sortVersions(entries: readonly VersionEntry[]): readonly VersionEntry[];
export declare function latestVersion(entries: readonly VersionEntry[]): VersionEntry | undefined;
export interface CreateVersionInput {
    readonly id: string;
    readonly at: number;
    readonly author: string;
    readonly name?: string;
    readonly summary?: string;
}
/** 建条目：时间非数字归 0（宁可排在最后，也不要整列顺序变成随机）。 */
export declare function createVersion(input: CreateVersionInput): VersionEntry;
/**
 * 重命名。空白名字等于"去掉名字"，退回自动版本——
 * 清空输入框却留下一个空标题的条目，用户会以为重命名失败了。
 */
export declare function renameVersion(entries: readonly VersionEntry[], id: string, name: string): readonly VersionEntry[];
export declare function deleteVersion(entries: readonly VersionEntry[], id: string): readonly VersionEntry[];
/** 请求恢复：进入"待确认"。同一条重复请求返回原对象。 */
export declare function requestRestore(state: RestoreState, entryId: string): RestoreState;
export declare function cancelRestore(state: RestoreState): RestoreState;
/** 用户点了"确认恢复"：进入执行态，组件据此上抛 `restore`。 */
export declare function confirmRestore(state: RestoreState): RestoreState;
export declare function restoreEntryId(state: RestoreState): string | undefined;
