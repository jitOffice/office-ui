import type { PropType } from 'vue';
/**
 * `OjLineSpacingPicker`（03 §3 / M2）：行距档位列表。
 *
 * 行距存的是**倍数**（1 / 1.15 / 1.5 / 2），不是 px：Word/WPS 的"多倍行距"就是这个语义，
 * 存 px 会在换字号时失真（14px 文字配 21px 行高，换成 32px 就挤成一团）。
 *
 * 选中态用 `aria-selected` 而不是只加 class：`role="listbox"` 里读屏靠它播报"当前第几项"。
 */
export declare const OjLineSpacingPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    presets: {
        type: PropType<readonly number[]>;
        default: () => readonly number[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: NumberConstructor;
        required: true;
    };
    presets: {
        type: PropType<readonly number[]>;
        default: () => readonly number[];
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    presets: readonly number[];
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
