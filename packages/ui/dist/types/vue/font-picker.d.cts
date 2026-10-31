import type { PropType } from 'vue';
import type { FontOption } from '../shell/fonts.cjs';
/**
 * `OjFontPicker`（03 §3 / M2）：字体列表 + 过滤 + 键盘。
 *
 * 每项用**自己的字体栈**渲染预览：字体选择器只显示名字等于让用户猜，
 * 尤其 `Serif` / `Sans` 这种词在中英混排下完全看不出差别。
 *
 * 过滤是纯子串匹配而不是模糊打分：字体列表通常只有几十项，
 * 打分排序会让"输入 sans 却排在第一的是 Doc Sans Mono"这类意外排到用户脸上。
 */
export declare const OjFontPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    fonts: {
        type: PropType<readonly FontOption[]>;
        default: () => readonly FontOption[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 搜索框的占位文案（语言相关，由使用方给）。 */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    previewText: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    fonts: {
        type: PropType<readonly FontOption[]>;
        default: () => readonly FontOption[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 搜索框的占位文案（语言相关，由使用方给）。 */
    placeholder: {
        type: StringConstructor;
        default: string;
    };
    previewText: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    fonts: readonly FontOption[];
    placeholder: string;
    previewText: string;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
