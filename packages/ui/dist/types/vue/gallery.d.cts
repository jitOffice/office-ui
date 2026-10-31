import type { PropType } from 'vue';
import type { GalleryItem } from '../shell/gallery.cjs';
/**
 * `OjGallery`（03 §3 / M2）：通用网格选择。
 *
 * 与 `OjRibbonGallery` 的分工：那个是 Ribbon 里的**溢出条目**（一行放不下就滚动），
 * 这个是**独立面板里的网格**（列数固定、方向键按行列走）。两者共用 `galleryNeighbor`，
 * 因为"上下键跳一整行"的边界算法只该有一份。
 *
 * 选中项用 `aria-selected`；网格外壳是 `role="listbox"`，每项 `role="option"`。
 */
export declare const OjGallery: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly GalleryItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "update:modelValue"[], "update:modelValue", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly GalleryItem[]>;
        required: true;
    };
    modelValue: {
        type: StringConstructor;
        required: true;
    };
    label: {
        type: StringConstructor;
        required: true;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    "onUpdate:modelValue"?: (...args: any[]) => any;
}>, {
    columns: number;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
