import type { PropType } from 'vue';
import type { ColorSwatchGroup } from '../shell/color.cjs';
/**
 * `OjColorPicker`（03 §3 / M2）。
 *
 * 两个刻意的取舍：
 *   1. 色板样本是 **token 引用**（`var(--oj-brand-6)`），不是十六进制——选完写进文档的是
 *      token，暗色档位与主题切换才会跟着变；
 *   2. 自定义色**只在提交时归一**（`#abc` → `#aabbcc`），输入过程中不重写输入框，
 *      否则用户打到第三个字符就被"补全"掉了。
 *
 * a11y：整体是 `listbox`，每块色是 `option`；色块本身没有文字，所以必须有 `swatchLabel`
 * 提供可访问名（默认回退到颜色值本身，读屏会念 `#3366FF`——不优雅但可辨认）。
 */
export declare const OjColorPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    groups: {
        type: PropType<readonly ColorSwatchGroup[]>;
        default: () => readonly ColorSwatchGroup[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 自定义色的输入框标签；不给就不渲染自定义栏。 */
    customLabel: {
        type: StringConstructor;
        default: string;
    };
    swatchLabel: {
        type: PropType<(value: string) => string>;
        default: undefined;
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
    groups: {
        type: PropType<readonly ColorSwatchGroup[]>;
        default: () => readonly ColorSwatchGroup[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 自定义色的输入框标签；不给就不渲染自定义栏。 */
    customLabel: {
        type: StringConstructor;
        default: string;
    };
    swatchLabel: {
        type: PropType<(value: string) => string>;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    groups: readonly ColorSwatchGroup[];
    customLabel: string;
    swatchLabel: (value: string) => string;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
