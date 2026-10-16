import type { PropType } from 'vue';
import type { PopperPlacement } from '../popper.ts';
export declare const OjPopper: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        required: true;
    };
    anchor: {
        type: PropType<HTMLElement | null>;
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
    placement: {
        type: PropType<PopperPlacement>;
        default: string;
    };
}>> & Readonly<{}>, {
    anchor: HTMLElement | null;
    placement: PopperPlacement;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
