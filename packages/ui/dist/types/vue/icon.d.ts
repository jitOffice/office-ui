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
    /**
     * 加载态旋转。只挂一个类名，动画写在样式表里：
     * 内联 `animation` 会绕开 `prefers-reduced-motion` 的媒体查询，
     * 而持续旋转的图标对前庭功能障碍用户是实打实的不适。
     */
    spin: {
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
    /**
     * 加载态旋转。只挂一个类名，动画写在样式表里：
     * 内联 `animation` 会绕开 `prefers-reduced-motion` 的媒体查询，
     * 而持续旋转的图标对前庭功能障碍用户是实打实的不适。
     */
    spin: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    size: string | number;
    label: string;
    decorative: boolean;
    spin: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
