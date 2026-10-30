import type { PropType, VNodeChild } from 'vue';
export interface OjDropdownButtonSlots {
    /** 触发器内容，缺省渲染 `label` */
    label?: () => VNodeChild;
    /** 菜单内容。条目带 `data-value` 就发 `select(value)`，没有则由插槽自己处理点击。 */
    default?: () => VNodeChild;
}
/**
 * `OjDropdownButton`（03 §3 B 组）：整颗按钮是触发器，点开是一组命令。
 *
 * 与 `OjSplitButton` 的差别只有一点：**这里没有主操作**。"边框"这类命令本身没有默认值，
 * 硬给它一个"应用上次选择"的主区，反而会让用户在不该改格式的时候改了格式。
 *
 * 键盘：`↓` 打开、`Esc` 关闭并把焦点还给触发器（03 §5 第 3 条），
 * 菜单条目的点击语义与拆分按钮一致——读 `data-value`。
 */
export declare const OjDropdownButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
    menuLabel: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("select" | "update:open")[], "select" | "update:open", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
    menuLabel: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
}>, {
    icon: string | undefined;
    disabled: boolean;
    open: boolean | undefined;
    size: "medium" | "mini";
    menuLabel: string | undefined;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
