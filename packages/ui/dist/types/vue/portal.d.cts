export declare const OjPortal: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    /** `'body' | '#selector' | false` */
    to: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    /** 层级，默认取浮层档；要盖住模态就用 `var(--oj-z-modal)` */
    zIndex: {
        type: StringConstructor;
        default: string;
    };
    lockScroll: {
        type: BooleanConstructor;
        default: boolean;
    };
    trapFocus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    /** `'body' | '#selector' | false` */
    to: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    /** 层级，默认取浮层档；要盖住模态就用 `var(--oj-z-modal)` */
    zIndex: {
        type: StringConstructor;
        default: string;
    };
    lockScroll: {
        type: BooleanConstructor;
        default: boolean;
    };
    trapFocus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    to: string | boolean;
    zIndex: string;
    lockScroll: boolean;
    trapFocus: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
