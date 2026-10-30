import type { PropType } from 'vue';
export interface OjAiMessage {
    role: 'user' | 'assistant';
    text: string;
}
export declare const OjAiPanel: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    title: {
        type: StringConstructor;
        required: true;
    };
    placeholder: {
        type: StringConstructor;
        required: true;
    };
    sendLabel: {
        type: StringConstructor;
        required: true;
    };
    messages: {
        type: PropType<readonly OjAiMessage[]>;
        default: () => never[];
    };
    notice: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "submit"[], "submit", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    title: {
        type: StringConstructor;
        required: true;
    };
    placeholder: {
        type: StringConstructor;
        required: true;
    };
    sendLabel: {
        type: StringConstructor;
        required: true;
    };
    messages: {
        type: PropType<readonly OjAiMessage[]>;
        default: () => never[];
    };
    notice: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onSubmit?: (...args: any[]) => any;
}>, {
    messages: readonly OjAiMessage[];
    notice: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
