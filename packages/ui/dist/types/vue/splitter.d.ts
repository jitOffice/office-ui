import type { PropType } from 'vue';
/**
 * `OjSplitter`（03 §3 D 组）：两栏之间的可拖拽分隔条。
 *
 * 只画一根条子，不画两侧的栏——`size` 描述的是**被调那一栏**的宽度/高度，
 * 由 `pane` 决定是分隔条之前还是之后那一栏（默认 `'after'`，即右侧批注栏 / 下方控制台）。
 * 方向必须显式声明：同一根条子既能表示"左栏收起"也能表示"右栏展开"，
 * 两种语义都不说清等于永远搞不懂往哪拖。往右拖是**把右栏压窄、把左栏放宽**。
 *
 * 受控：拖拽只上抛 `update:size`，本地不留尺寸副本。拖拽期间宿主可能同时在钳制
 * （窗口缩小、另一栏被折叠），本地存一份就会出现松开后"跳一下"。
 *
 * 键盘走 WAI-ARIA window splitter 的语义：方向键移动的是**分隔条本身**，
 * 不是"把数值调大"——否则右栏的右键与左栏的右键行为相反，谁都用不对。
 */
export declare const OjSplitter: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** 被调那一栏的尺寸（px）。 */
    size: {
        type: NumberConstructor;
        required: true;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 被调的是分隔条**之前**还是**之后**那一栏。 */
    pane: {
        type: PropType<'before' | 'after'>;
        default: string;
    };
    orientation: {
        type: PropType<'vertical' | 'horizontal'>;
        default: string;
    };
    /** 分隔条的可访问名（"调整批注栏宽度"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    step: {
        type: NumberConstructor;
        default: number;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("drag-end" | "drag-start" | "update:size")[], "drag-end" | "drag-start" | "update:size", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** 被调那一栏的尺寸（px）。 */
    size: {
        type: NumberConstructor;
        required: true;
    };
    min: {
        type: NumberConstructor;
        default: number;
    };
    max: {
        type: NumberConstructor;
        default: number;
    };
    collapsible: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 被调的是分隔条**之前**还是**之后**那一栏。 */
    pane: {
        type: PropType<'before' | 'after'>;
        default: string;
    };
    orientation: {
        type: PropType<'vertical' | 'horizontal'>;
        default: string;
    };
    /** 分隔条的可访问名（"调整批注栏宽度"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    step: {
        type: NumberConstructor;
        default: number;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onDrag-end"?: (...args: any[]) => any;
    "onDrag-start"?: (...args: any[]) => any;
    "onUpdate:size"?: (...args: any[]) => any;
}>, {
    min: number;
    max: number;
    collapsible: boolean;
    pane: "after" | "before";
    orientation: "horizontal" | "vertical";
    step: number;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
