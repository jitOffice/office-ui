export declare const OjIcon: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    size: {
        type: (NumberConstructor | StringConstructor)[];
        default: undefined;
    };
    label: {
        type: StringConstructor;
        default: undefined;
    };
    /** 装饰性图标：显式声明「这枚图标没有语义」，渲染 `aria-hidden`（03 §2）。 */
    decorative: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        required: true;
    };
    size: {
        type: (NumberConstructor | StringConstructor)[];
        default: undefined;
    };
    label: {
        type: StringConstructor;
        default: undefined;
    };
    /** 装饰性图标：显式声明「这枚图标没有语义」，渲染 `aria-hidden`（03 §2）。 */
    decorative: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    size: string | number;
    label: string;
    decorative: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
