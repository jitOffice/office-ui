import type { PropType } from 'vue';
import type { FileNode } from '../shell/files.cjs';
export declare const OjFileTree: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    nodes: {
        type: PropType<readonly FileNode[]>;
        required: true;
    };
    openIds: {
        type: PropType<readonly string[]>;
        default: () => never[];
    };
    selectedId: {
        type: StringConstructor;
        default: string;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("select" | "toggle")[], "select" | "toggle", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    nodes: {
        type: PropType<readonly FileNode[]>;
        required: true;
    };
    openIds: {
        type: PropType<readonly string[]>;
        default: () => never[];
    };
    selectedId: {
        type: StringConstructor;
        default: string;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
    onToggle?: (...args: any[]) => any;
}>, {
    openIds: readonly string[];
    selectedId: string;
    emptyLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
