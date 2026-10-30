import type { PropType, VNodeChild } from 'vue';
import type { RibbonItemSpec, RibbonPackedItem } from '../ribbon.cjs';
/**
 * `OjRibbonGroup`（03 §3 B 组）：组内命令按 large/medium/small 三档铺开，
 * 宽度不足先降级、再收进 `»`。
 *
 * 宽度从哪来：
 *   - 每项都给了 `width` / `widths` → 直接用，一次都不量（SSR、快照测试走这条）；
 *   - 没给 → **自己量**：先按设计尺寸渲染出来量第一档，还装不下就整组按 medium、
 *     再按 small 各探一版，量到就记表；最后交给 `packRibbon` 按真实宽度决定
 *     每一项降几档、哪些进 `»`。探测的那一版加了 `data-probe`，视觉上不可见，
 *     不会让用户看到"先挤一下再弹回来"。
 *
 * 可用宽度同理：宿主给 `available` 就直接用（编辑器已知面板宽、虚拟化列表）；
 * 不给就用 `ResizeObserver` 量自己。此时组必须是**被父级约束宽度**的
 * （`flex: 1 1 auto` / 固定宽 / grid 列），否则它的宽度由内容撑开，
 * 永远"装得下"，永远不降级——这是 ResizeObserver 做自适应最常见的一种假成功。
 */
export interface OjRibbonGroupSlots {
    /** 一条命令。`item.display` 是**降级之后**实际该用的尺寸。 */
    item?: (scope: {
        item: RibbonPackedItem;
    }) => VNodeChild;
    /** `»` 菜单里的同一条命令；缺省沿用 `item`。 */
    overflow?: (scope: {
        item: RibbonPackedItem;
    }) => VNodeChild;
    /** 组右下角的启动器（`OjCommandLauncher`）。缺省不渲染——不是每个组都有对话框 */
    launcher?: () => VNodeChild;
}
export declare const OjRibbonGroup: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly RibbonItemSpec[]>;
        required: true;
    };
    /** 可用宽度。给了就不观察 DOM，宿主自己掌握的那一路（SSR、虚拟化列表）走这里 */
    available: {
        type: PropType<number | undefined>;
        default: undefined;
    };
    /** 与 CSS 的 gap 同源：由组件写进 style，避免"预算按 2px、排版按 4px"那种错位 */
    gap: {
        type: NumberConstructor;
        default: number;
    };
    overflowWidth: {
        type: NumberConstructor;
        default: number;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly RibbonItemSpec[]>;
        required: true;
    };
    /** 可用宽度。给了就不观察 DOM，宿主自己掌握的那一路（SSR、虚拟化列表）走这里 */
    available: {
        type: PropType<number | undefined>;
        default: undefined;
    };
    /** 与 CSS 的 gap 同源：由组件写进 style，避免"预算按 2px、排版按 4px"那种错位 */
    gap: {
        type: NumberConstructor;
        default: number;
    };
    overflowWidth: {
        type: NumberConstructor;
        default: number;
    };
    label: {
        type: PropType<string | undefined>;
        default: undefined;
    };
    overflowLabel: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    available: number | undefined;
    gap: number;
    overflowWidth: number;
    label: string | undefined;
    overflowLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
