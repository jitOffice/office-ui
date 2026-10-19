import type { PropType } from 'vue';
export declare const OjRuler: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    length: {
        type: NumberConstructor;
        required: true;
    };
    zoom: {
        type: NumberConstructor;
        required: true;
    };
    orientation: {
        type: PropType<'horizontal' | 'vertical'>;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    length: {
        type: NumberConstructor;
        required: true;
    };
    zoom: {
        type: NumberConstructor;
        required: true;
    };
    orientation: {
        type: PropType<'horizontal' | 'vertical'>;
        default: string;
    };
}>> & Readonly<{}>, {
    orientation: "horizontal" | "vertical";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
