import type { PropType } from 'vue';
import type { BorderValue } from '../shell/border.ts';
/**
 * `OjBorderPicker`（03 §3 / M2）：线型 + 线宽 + 颜色。
 *
 * 三个维度写在同一张卡片里、一次 `change` 出去，而不是三次独立的 `update:*`：
 * 选线型时宽度会从 1 变成 0（`none` 的语义），如果拆成三个事件，
 * 使用方会收到"线型变了但宽度还是 1"的中间态，写进文档后就是一条看不见的 1px 线。
 *
 * 预览块直接用 `borderCss()` 生成：与"应用到选区"走同一个函数，
 * 两套字符串拼法迟早会不一致（预览是虚线、文档里是实线）。
 */
export declare const OjBorderPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: PropType<Partial<BorderValue>>;
        default: () => {};
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    widthLabel: {
        type: StringConstructor;
        required: true;
    };
    colorLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 线型显示名（语言相关）。 */
    styleLabels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: PropType<Partial<BorderValue>>;
        default: () => {};
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    widthLabel: {
        type: StringConstructor;
        required: true;
    };
    colorLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 线型显示名（语言相关）。 */
    styleLabels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    modelValue: Partial<BorderValue>;
    styleLabels: Readonly<Record<string, string>>;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
