import type { PropType } from 'vue';
import type { TriggerMode } from '../trigger.cjs';
import type { PopperPlacement } from '../popper.cjs';
/**
 * 触发器 + 浮层（prd/03 §3 D 组）：`hover/click/focus/manual` 可组合，含离开延迟。
 *
 * 交互语义全在 `../trigger.ts` 的机器里（零依赖可测），这里只负责把 DOM 事件接上去、
 * 以及把面板放进 `OjPortal` + `OjPopper`。
 *
 * 受控与非受控都给：传 `open` 就是受控（配 `@update:open`），不传就内部自己管。
 * 03 §2 要求"所有可选面板组件同时支持 `v-model` 与 `defaultVisible`"——只给受控会把
 * "我想临时弹一下"这种最常见的用法写复杂。
 */
export declare const OjTrigger: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        default: boolean;
    };
    modes: {
        type: PropType<TriggerMode[] | TriggerMode>;
        default: () => string[];
    };
    placement: {
        type: PropType<PopperPlacement>;
        default: string;
    };
    openDelay: {
        type: NumberConstructor;
        default: number;
    };
    closeDelay: {
        type: NumberConstructor;
        default: number;
    };
    /** 面板是否挂到 body（`false` 留在原地） */
    portal: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 透传给 `OjPortal` 的挂载点 */
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    lockScroll: {
        type: BooleanConstructor;
        default: boolean;
    };
    trapFocus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("close" | "open" | "update:open")[], "close" | "open" | "update:open", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    open: {
        type: BooleanConstructor;
        default: boolean;
    };
    modes: {
        type: PropType<TriggerMode[] | TriggerMode>;
        default: () => string[];
    };
    placement: {
        type: PropType<PopperPlacement>;
        default: string;
    };
    openDelay: {
        type: NumberConstructor;
        default: number;
    };
    closeDelay: {
        type: NumberConstructor;
        default: number;
    };
    /** 面板是否挂到 body（`false` 留在原地） */
    portal: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 透传给 `OjPortal` 的挂载点 */
    teleport: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    lockScroll: {
        type: BooleanConstructor;
        default: boolean;
    };
    trapFocus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onClose?: (...args: any[]) => any;
    onOpen?: (...args: any[]) => any;
    "onUpdate:open"?: (...args: any[]) => any;
}>, {
    open: boolean;
    modes: TriggerMode[] | TriggerMode;
    placement: PopperPlacement;
    openDelay: number;
    closeDelay: number;
    portal: boolean;
    teleport: string | boolean;
    lockScroll: boolean;
    trapFocus: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
