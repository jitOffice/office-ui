import type { PropType } from 'vue';
import type { CommentThread } from '../shell/comments.ts';
/**
 * `OjCommentThread`（03 §3 E 组）：单条批注 + 回复 + 解决/重开。
 *
 * 组件**自己不改传进来的线程**：回复走 `reply` 事件、解决态走 `toggle-resolved`，
 * 由宿主拿 `addReply()` / `setResolved()` 算完再传回来。受控是刻意的——
 * 批注列表要落盘、要协同同步，组件内部藏一份状态就会与真实数据分叉。
 *
 * 时间由 `formatTime` 传入而不是组件内 `toLocaleString()`：时间格式跟着语言包走，
 * 组件里自己格式化会让同一页面出现两种日期写法。
 */
export declare const OjCommentThread: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    thread: {
        type: PropType<CommentThread>;
        required: true;
    };
    /** 时间格式化（由使用方按语言给）。 */
    formatTime: {
        type: PropType<(at: number) => string>;
        required: true;
    };
    resolveLabel: {
        type: StringConstructor;
        required: true;
    };
    reopenLabel: {
        type: StringConstructor;
        required: true;
    };
    replyLabel: {
        type: StringConstructor;
        required: true;
    };
    replyPlaceholder: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("reply" | "toggle-resolved")[], "reply" | "toggle-resolved", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    thread: {
        type: PropType<CommentThread>;
        required: true;
    };
    /** 时间格式化（由使用方按语言给）。 */
    formatTime: {
        type: PropType<(at: number) => string>;
        required: true;
    };
    resolveLabel: {
        type: StringConstructor;
        required: true;
    };
    reopenLabel: {
        type: StringConstructor;
        required: true;
    };
    replyLabel: {
        type: StringConstructor;
        required: true;
    };
    replyPlaceholder: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onReply?: (...args: any[]) => any;
    "onToggle-resolved"?: (...args: any[]) => any;
}>, {
    replyPlaceholder: string;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
