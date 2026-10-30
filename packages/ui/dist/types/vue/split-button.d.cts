import type { PropType, VNodeChild } from 'vue';
export interface OjSplitButtonSlots {
    /** 主操作区的内容，缺省渲染 `label` */
    label?: () => VNodeChild;
    /** 菜单内容。条目带 `data-value` 就会发 `select(value)`；不带则点击由插槽自己处理。 */
    default?: () => VNodeChild;
}
/**
 * `OjSplitButton`（03 §3 B 组）：主操作与下拉箭头**分成两个可点区域**。
 *
 * 这条拆分是这类控件的全部价值：合成一个按钮的话，"粘贴"与"粘贴为纯文本"会变成
 * 点两次才能选到，而用户想要的往往是默认那一下。所以点击主区只发 `run`，
 * 箭头只负责开菜单；靠的是两个独立的 `<button>`，不是在一个按钮里判断坐标。
 *
 * 菜单条目读 `data-value`：有值就发 `select(value)`，没有就让插槽自己处理点击。
 */
export declare const OjSplitButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    icon: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 受控展开；不给则组件自己记（仍会发 `update:open`） */
    open: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
    menuLabel: {
        type: StringConstructor;
        default: string;
    };
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("run" | "select" | "update:open")[], "run" | "select" | "update:open", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    icon: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 受控展开；不给则组件自己记（仍会发 `update:open`） */
    open: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
    menuLabel: {
        type: StringConstructor;
        default: string;
    };
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>> & Readonly<{
    onRun?: (...args: any[]) => any;
    onSelect?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
}>, {
    icon: string | undefined;
    disabled: boolean;
    open: boolean | undefined;
    menuLabel: string;
    size: "medium" | "mini";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
