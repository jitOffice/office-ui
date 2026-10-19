import type { PropType } from 'vue';
export interface OjTabItem {
    id: string;
    label: string;
}
export declare const OjTabs: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjTabItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjTabItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
