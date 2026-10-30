import type { PropType } from 'vue';
import type { Box, PopperPlacement } from '../popper.cjs';
export declare const OjPopper: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    anchor: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
    /**
     * 锚**矩形**（视口坐标），优先级高于 `anchor`。
     *
     * 03 §3 D 组点名的两种场景都落在这里：canvas 上的右键坐标（没有 DOM 目标，
     * 矩形退化成零尺寸点）与文本选区的包围盒（锚点是一片区域，不是一个元素）。
     */
    anchorBox: {
        type: PropType<Pick<Box, 'x' | 'y' | 'width' | 'height'> | null>;
        default: null;
    };
    placement: {
        type: PropType<PopperPlacement>;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    anchor: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
    /**
     * 锚**矩形**（视口坐标），优先级高于 `anchor`。
     *
     * 03 §3 D 组点名的两种场景都落在这里：canvas 上的右键坐标（没有 DOM 目标，
     * 矩形退化成零尺寸点）与文本选区的包围盒（锚点是一片区域，不是一个元素）。
     */
    anchorBox: {
        type: PropType<Pick<Box, 'x' | 'y' | 'width' | 'height'> | null>;
        default: null;
    };
    placement: {
        type: PropType<PopperPlacement>;
        default: string;
    };
}>> & Readonly<{}>, {
    anchor: HTMLElement | null;
    anchorBox: Pick<Box, "height" | "width" | "x" | "y"> | null;
    placement: PopperPlacement;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
