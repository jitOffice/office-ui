import type { PropType } from 'vue';
import type { OjCommandLike } from '../commands.ts';
import type { OjEditorState } from '../editor-host.ts';
export interface OjCommandView {
    label: OjCommandLike['label'];
    icon?: string;
}
/** 命令按钮要读的那一面。`createCommandRegistry()` 的返回值可以直接传进来。 */
export interface OjCommandButtonSource {
    get(id: string): OjCommandView | undefined;
    state(id: string): OjEditorState | undefined;
    resolve(message: OjCommandLike['label']): string;
    run(id: string, arg?: unknown): Promise<unknown>;
    subscribe(id: string, listener: (state: OjEditorState) => void): () => void;
}
export declare const OjCommandButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    source: {
        type: PropType<OjCommandButtonSource>;
        required: true;
    };
    id: {
        type: StringConstructor;
        required: true;
    };
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    source: {
        type: PropType<OjCommandButtonSource>;
        required: true;
    };
    id: {
        type: StringConstructor;
        required: true;
    };
    size: {
        type: PropType<'mini' | 'medium'>;
        default: string;
    };
}>> & Readonly<{}>, {
    size: "medium" | "mini";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
