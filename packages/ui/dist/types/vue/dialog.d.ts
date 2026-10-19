export declare const OjDialog: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    confirmLabel: {
        type: StringConstructor;
        default: string;
    };
    cancelLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("cancel" | "confirm" | "update:open")[], "cancel" | "confirm" | "update:open", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    confirmLabel: {
        type: StringConstructor;
        default: string;
    };
    cancelLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onCancel?: (...args: any[]) => any;
    onConfirm?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
}>, {
    confirmLabel: string;
    cancelLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
