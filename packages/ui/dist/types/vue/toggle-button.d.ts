import type { PropType } from 'vue';
/**
 * `OjToggleButton`（03 §3 B 组）：自己记按下态，用于格式刷、修订模式这类**本地开关**。
 *
 * 和 `OjCommandButton` 的区别是状态从哪来：命令按钮的状态由注册表推给它（唯一事实来源），
 * 开关按钮的状态属于使用方（`v-model`）。两者都用 `aria-pressed`——用 `data-active` 只做样式
 * 而不给读屏一个说法，是这类控件最常见的无障碍缺口。
 */
export declare const OjToggleButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: BooleanConstructor;
        required: true;
    };
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
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: BooleanConstructor;
        required: true;
    };
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
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    icon: string | undefined;
    disabled: boolean;
    size: "medium" | "mini";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
