/**
 * 批注线程模型（03 §3 E 组 `OjCommentThread`）。
 *
 * 批注是**不可变追加**的：一条批注一旦发出，正文与作者都不能改，只能追加回复、切换解决状态。
 * 这让"协同下两边同时编辑"的冲突面缩到最小——唯一会冲突的是 `resolved` 这个布尔量，
 * 而它的冲突语义清晰（谁最后点谁赢）。
 *
 * 线程状态机刻意只有两态。Word 里"解决"不等于删除：解决的批注还在，`Ctrl+Z` 也退不回来，
 * 所以这里不做删除，`resolved` 就能表达全部状态。真要删除是宿主的事（它持有持久化）。
 */
import type { OjPerson } from './people.ts';
export interface CommentReply {
    readonly id: string;
    readonly author: OjPerson;
    /** 毫秒时间戳。存数字不存字符串：格式化属于显示层，语言不同写法不同。 */
    readonly at: number;
    readonly text: string;
}
export interface CommentThread {
    readonly id: string;
    /** 正文锚点（选区 id 或块 id）。宿主用它把批注挂回文档。 */
    readonly anchor: string;
    readonly author: OjPerson;
    readonly at: number;
    readonly text: string;
    readonly replies: readonly CommentReply[];
    readonly resolved: boolean;
}
/**
 * 追加回复。**不改变解决状态**：已解决的线程收到回复仍是已解决，
 * 想重开得显式点"重新打开"——反过来（自动重开）会让"我回复一句确认"变成一次状态回退。
 *
 * 空文本直接返回原对象（引用不变）：上游 `watch` 不会因为一次空提交重渲染。
 */
export declare function addReply(thread: CommentThread, reply: CommentReply): CommentThread;
/** 切换解决状态。传 `resolved` 而不是"翻转"，因为协同下两次点击可能基于同一个旧状态。 */
export declare function setResolved(thread: CommentThread, resolved: boolean): CommentThread;
export interface CommentCounts {
    readonly total: number;
    readonly open: number;
    readonly resolved: number;
    /** 回复总数（不含首条批注）。侧栏折叠时显示"3 条批注 · 5 条回复"用它。 */
    readonly replies: number;
}
export declare function commentCounts(threads: readonly CommentThread[]): CommentCounts;
export type CommentFilter = 'all' | 'open' | 'resolved';
/** 侧栏筛选。不认识的取值按 `all` 处理：筛选器是 UI 状态，不该因为一个脏值让列表整个空掉。 */
export declare function filterThreads(threads: readonly CommentThread[], filter: CommentFilter): CommentThread[];
/**
 * 下一条未解决批注的 id（侧栏"下一个批注"按钮用）。
 *
 * 到末尾**不环绕**：环绕会让"已看完最后一条"变成"跳回第一条"，用户不知道看完了。
 * 全部已解决时返回 `undefined`，让按钮自己灰掉。
 */
export declare function nextOpenThread(threads: readonly CommentThread[], currentId: string | undefined, direction?: 1 | -1): string | undefined;
