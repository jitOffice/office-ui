import type { PropType } from 'vue';
import type { StylePreset } from '../shell/style-gallery.ts';
/**
 * `OjStyleGallery`（03 §3 / M2）：段落样式画廊。
 *
 * 每一项都用**预设自己的排版**渲染示例文本：只显示"标题 1/2/3"等于让用户背编号，
 * 而样式画廊的价值恰恰是"一眼看出层级"。
 *
 * 示例文本由 `sample` 给（语言相关：日文界面应该看到かな，而不是 "Aa"）。
 */
export declare const OjStyleGallery: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    presets: {
        type: PropType<readonly StylePreset[]>;
        default: () => readonly StylePreset[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    labels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    sample: {
        type: StringConstructor;
        default: string;
    };
    columns: {
        type: NumberConstructor;
        default: number;
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
    presets: {
        type: PropType<readonly StylePreset[]>;
        default: () => readonly StylePreset[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    labels: {
        type: PropType<Readonly<Record<string, string>>>;
        default: () => {};
    };
    sample: {
        type: StringConstructor;
        default: string;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    presets: readonly StylePreset[];
    labels: Readonly<Record<string, string>>;
    sample: string;
    columns: number;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
