import type { PropType, VNodeChild } from 'vue';
import type { RibbonItemSpec, RibbonPackedItem } from '../ribbon.ts';
export type ToolbarOverflow = 'menu' | 'scroll' | 'wrap';
export interface OjToolbarSlots {
    /** 一条命令；`item.display` 只对 `overflow: 'menu'` 有意义（其余模式不降级） */
    item?: (scope: {
        item: RibbonPackedItem;
    }) => VNodeChild;
    /** `»` 菜单里的条目，缺省沿用 `item` */
    overflow?: (scope: {
        item: RibbonPackedItem;
    }) => VNodeChild;
}
/**
 * `OjToolbar`（03 §3 B 组）：单行工具条，是 Ribbon 的简化形态（JitKnow、轻量编辑器用）。
 *
 * 三种溢出策略是**产品决策**，不是样式细节：
 *   - `menu`：宽度不够收进 `»`。位置稳定，盲操不会点错，代价是多一次点击；
 *   - `scroll`：横向滚动。适合命令多但用户不常横向滚的场景，代价是右侧命令**看不见**；
 *   - `wrap`：折行。命令全都可见，代价是吃掉两行高度、把正文往下推。
 * 默认 `menu`：办公场景里"按钮突然跑到第二行"比"多点一次"更让人措手不及。
 *
 * `menu` 直接复用 `OjRibbonGroup`——降级/溢出的预算逻辑只有一份，工具条不该有第二套。
 */
export declare const OjToolbar: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly RibbonItemSpec[]>;
        required: true;
    };
    overflow: {
        type: PropType<ToolbarOverflow>;
        default: string;
    };
    available: {
        type: PropType<number | undefined>;
        default: undefined;
    };
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
    overflow: {
        type: PropType<ToolbarOverflow>;
        default: string;
    };
    available: {
        type: PropType<number | undefined>;
        default: undefined;
    };
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
    overflow: ToolbarOverflow;
    available: number | undefined;
    gap: number;
    overflowWidth: number;
    label: string | undefined;
    overflowLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
