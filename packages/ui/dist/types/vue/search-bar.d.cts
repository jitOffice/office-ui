export declare const OjSearchReplaceBar: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    find: {
        type: StringConstructor;
        default: string;
    };
    replace: {
        type: StringConstructor;
        default: string;
    };
    matchCase: {
        type: BooleanConstructor;
        default: boolean;
    };
    current: {
        type: NumberConstructor;
        default: number;
    };
    total: {
        type: NumberConstructor;
        default: number;
    };
    findLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceLabel: {
        type: StringConstructor;
        required: true;
    };
    nextLabel: {
        type: StringConstructor;
        required: true;
    };
    previousLabel: {
        type: StringConstructor;
        required: true;
    };
    matchCaseLabel: {
        type: StringConstructor;
        required: true;
    };
    countLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceActionLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceAllLabel: {
        type: StringConstructor;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("next" | "previous" | "replace" | "replace-all" | "update:find" | "update:matchCase" | "update:replace")[], "next" | "previous" | "replace" | "replace-all" | "update:find" | "update:matchCase" | "update:replace", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    find: {
        type: StringConstructor;
        default: string;
    };
    replace: {
        type: StringConstructor;
        default: string;
    };
    matchCase: {
        type: BooleanConstructor;
        default: boolean;
    };
    current: {
        type: NumberConstructor;
        default: number;
    };
    total: {
        type: NumberConstructor;
        default: number;
    };
    findLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceLabel: {
        type: StringConstructor;
        required: true;
    };
    nextLabel: {
        type: StringConstructor;
        required: true;
    };
    previousLabel: {
        type: StringConstructor;
        required: true;
    };
    matchCaseLabel: {
        type: StringConstructor;
        required: true;
    };
    countLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceActionLabel: {
        type: StringConstructor;
        required: true;
    };
    replaceAllLabel: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{
    onNext?: (...args: any[]) => any;
    onPrevious?: (...args: any[]) => any;
    onReplace?: (...args: any[]) => any;
    "onReplace-all"?: (...args: any[]) => any;
    "onUpdate:find"?: (...args: any[]) => any;
    "onUpdate:matchCase"?: (...args: any[]) => any;
    "onUpdate:replace"?: (...args: any[]) => any;
}>, {
    find: string;
    replace: string;
    matchCase: boolean;
    current: number;
    total: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
