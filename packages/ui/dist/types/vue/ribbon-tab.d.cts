import type { PropType } from 'vue';
export interface OjRibbonTabItem {
    id: string;
    label: string;
    /** Key Tip：按 `Alt` 后浮在标签上的字母（03 §5 第 2 条）。中日韩标签推不出字母，必须显式给。 */
    keyTip?: string;
}
/**
 * `OjRibbonTab`（03 §3 B 组）：一个选项卡按钮。
 *
 * 刻意不做键盘：方向键与 `Home`/`End` 是 **tablist** 的语义（roving tabindex），
 * 逻辑在 `OjRibbon` 上；Key Tip 的**显示时机**也归 `OjRibbon`（Alt 的 keyup 事件在文档层）。
 * 这里只负责 `role="tab"`、`aria-selected`、点击，以及那枚提示键的渲染。
 */
export declare const OjRibbonTab: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    id: {
        type: StringConstructor;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    selected: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyTip: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    /** 按 `Alt` 期间才显示提示键 */
    showKeyTip: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    id: {
        type: StringConstructor;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    selected: {
        type: BooleanConstructor;
        default: boolean;
    };
    keyTip: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    /** 按 `Alt` 期间才显示提示键 */
    showKeyTip: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
}>, {
    selected: boolean;
    keyTip: string | undefined;
    showKeyTip: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
