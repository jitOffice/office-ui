import type { PropType } from 'vue';
import type { ReviewChange, ReviewKind } from '../shell/review.cjs';
/**
 * `OjReviewPanel`（03 §3 E 组）：修订列表 + 逐条/批量接受拒绝。
 *
 * 三件事按 Word 的语义钉住，改之前先读 03 §8：
 *
 *   1. **"全部接受"只作用于当前筛选结果**（`decideAll(changes, filter)` 同一条规则）。
 *      在"只看张三"的筛选下连李四的修订一起接受，是数据事故而不是效率提升。
 *   2. **决策后条目从列表消失**，不留"已接受"灰条：留灰条会让人以为还能再点一次。
 *   3. **筛选是本地 UI 状态**，不往上报。筛选器一变就通知宿主，会逼着宿主也存一份筛选状态，
 *      于是两个面板的筛选各走各的。
 *
 * 文案全部由使用方给：种类名要做成 `kindLabels` 映射，是因为"插入/删除/格式"在四种语言里
 * 都不是能靠拼接得到的。
 */
export declare const OjReviewPanel: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    changes: {
        type: PropType<readonly ReviewChange[]>;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    acceptLabel: {
        type: StringConstructor;
        required: true;
    };
    rejectLabel: {
        type: StringConstructor;
        required: true;
    };
    acceptAllLabel: {
        type: StringConstructor;
        required: true;
    };
    rejectAllLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 空态文案（"没有待处理的修订"）。 */
    emptyLabel: {
        type: StringConstructor;
        required: true;
    };
    /** "全部种类"这一档的名字。 */
    allKindsLabel: {
        type: StringConstructor;
        required: true;
    };
    kindLabels: {
        type: PropType<Readonly<Record<ReviewKind, string>>>;
        default: () => {
            insert: string;
            delete: string;
            format: string;
        };
    };
    formatTime: {
        type: PropType<(at: number) => string>;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("decide" | "decide-all")[], "decide" | "decide-all", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    changes: {
        type: PropType<readonly ReviewChange[]>;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    acceptLabel: {
        type: StringConstructor;
        required: true;
    };
    rejectLabel: {
        type: StringConstructor;
        required: true;
    };
    acceptAllLabel: {
        type: StringConstructor;
        required: true;
    };
    rejectAllLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 空态文案（"没有待处理的修订"）。 */
    emptyLabel: {
        type: StringConstructor;
        required: true;
    };
    /** "全部种类"这一档的名字。 */
    allKindsLabel: {
        type: StringConstructor;
        required: true;
    };
    kindLabels: {
        type: PropType<Readonly<Record<ReviewKind, string>>>;
        default: () => {
            insert: string;
            delete: string;
            format: string;
        };
    };
    formatTime: {
        type: PropType<(at: number) => string>;
        required: true;
    };
}>> & Readonly<{
    onDecide?: (...args: any[]) => any;
    "onDecide-all"?: (...args: any[]) => any;
}>, {
    kindLabels: Readonly<Record<ReviewKind, string>>;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
