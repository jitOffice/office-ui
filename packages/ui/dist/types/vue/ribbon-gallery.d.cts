import type { PropType, VNodeChild } from 'vue';
export interface OjRibbonGalleryItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    active?: boolean;
}
export interface OjRibbonGallerySlots {
    /** 自定义一格的内容，缺省是「图标 + 文字」 */
    item?: (scope: {
        item: OjRibbonGalleryItem;
        index: number;
    }) => VNodeChild;
}
/**
 * `OjRibbonGallery`（03 §3 B 组 🟡）：命令的网格陈列（样式库、符号）。
 *
 * 网格的键盘模型和普通列表不一样：上下要按**整行**跳、左右按格跳，且最后一行不满
 * 也不能走出边界。这段规则放在 `galleryNeighbor`（零依赖、有单测），组件只负责
 * roving tabindex 与把焦点真的挪过去。
 */
export declare const OjRibbonGallery: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjRibbonGalleryItem[]>;
        required: true;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly OjRibbonGalleryItem[]>;
        required: true;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
}>> & Readonly<{
    onSelect?: (...args: any[]) => any;
}>, {
    columns: number;
    label: string | undefined;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
