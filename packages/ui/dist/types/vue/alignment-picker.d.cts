import type { PropType } from 'vue';
import type { AlignmentValue } from '../shell/alignment.cjs';
export declare const OjAlignmentPicker: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    modelValue: {
        type: PropType<Partial<AlignmentValue>>;
        default: () => {};
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 每个按钮的可访问名（语言相关，由使用方给）；缺省时用 id。 */
    itemLabels: {
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
        type: PropType<Partial<AlignmentValue>>;
        default: () => {};
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    /** 每个按钮的可访问名（语言相关，由使用方给）；缺省时用 id。 */
    itemLabels: {
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
    modelValue: Partial<AlignmentValue>;
    itemLabels: Readonly<Record<string, string>>;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
