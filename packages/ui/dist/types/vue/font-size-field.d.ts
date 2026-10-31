import type { PropType } from 'vue';
/**
 * `OjFontSizeField`（03 §3 / M2）：字号输入 + 档位选择。
 *
 * 三件事必须同时成立，否则在实际使用里会互相打架：
 *   1. **可以手输**：Word 用户会直接打 17px（虽然 token 里没有这一档）；
 *   2. **上下键走档位**：不是 ±1，而是 12 → 13 → 14 → 16…（Office 的行为）；
 *   3. **档位与 token 对齐**：`FONT_SIZE_PRESETS` 就是 `--oj-fs-*` 那八档，
 *      所以选中什么字号，`ja` / `compact` 档位降字号时它才会跟着降。
 */
export declare const OjFontSizeField: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
    decreaseLabel: {
        type: StringConstructor;
        required: true;
    };
    increaseLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 单位后缀（`px` / `pt`），只影响显示。 */
    unit: {
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
    decreaseLabel: {
        type: StringConstructor;
        required: true;
    };
    increaseLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 单位后缀（`px` / `pt`），只影响显示。 */
    unit: {
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
    presets: readonly number[];
    unit: string;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
