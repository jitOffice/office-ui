import type { PropType, VNodeChild } from 'vue';
import type { OjRibbonTabItem } from './ribbon-tab.cjs';
export interface OjRibbonSlots {
    /** 当前选项卡的面板内容。组件在收起时只隐藏、不卸载，面板里的选择器/搜索框不该丢状态。 */
    default?: (scope: {
        tab: string;
    }) => VNodeChild;
}
/**
 * `OjRibbon`（03 §3 B 组）：选项卡 + 组 + 自动折叠（双击标签收起，同 Word）。
 *
 * 折叠拆成 `collapsed`（固定）与 `peek`（临时）两个状态，规则全在 `ribbon.ts` 的纯函数里，
 * 这里只做碰 DOM 的那几件事：派发点击/双击、把方向键换成标签切换、收起时把焦点留在标签上、
 * "点面板外面就收回临时展开"，以及 `Alt` 唤起 Key Tips 后按字母直达标签。
 *
 * ARIA 按 03 §5 的第 2、4 条：外层 `tablist` + `tab` + `tabpanel`，
 * 收起/展开按钮带 `aria-expanded`，方向键在标签间循环，配了 Key Tip 的标签带 `aria-keyshortcuts`。
 */
export declare const OjRibbon: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjRibbonTabItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    /** 受控折叠：给了就听外部的；不给则由组件自己记（仍会发 `update:collapsed`） */
    collapsed: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    collapseLabel: {
        type: StringConstructor;
        default: string;
    };
    expandLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:collapsed" | "update:modelValue")[], "update:collapsed" | "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjRibbonTabItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    /** 受控折叠：给了就听外部的；不给则由组件自己记（仍会发 `update:collapsed`） */
    collapsed: {
        type: PropType<boolean | undefined>;
        default: undefined;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    collapseLabel: {
        type: StringConstructor;
        default: string;
    };
    expandLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    "onUpdate:collapsed"?: (...args: any[]) => any;
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    collapsed: boolean | undefined;
    label: string | undefined;
    collapseLabel: string;
    expandLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
