import type { PropType } from 'vue';
import type { VirtualItem } from '../shell/virtual.ts';
/** 默认插槽拿到的行上下文。`measure` 要在行挂载与尺寸变化时调用，否则高度永远停在估算值。 */
export interface OjVirtualRow {
    readonly item: VirtualItem;
    readonly index: number;
    readonly measure: (height: number) => void;
}
/**
 * `OjVirtualList`（03 §3 D 组）：变高虚拟列表，带 `scrollToIndex` 与锚点稳定。
 *
 * 只渲染 `visibleRange()` 给出的窗口，其余高度由 spacer 撑着。三条不变量：
 *   - **向上插入不跳**：数据更新前记下"视口顶部那一行 + 偏移"，更新后还原；锚点行被删掉时
 *     保持当前滚动位置（猜一个位置只会让用户从头找）。
 *   - **测量只改被量那一行之后的偏移**，前面的行纹丝不动，所以测量期不会抖。
 *   - **视口高度优先用 `viewportSize`**，没给才量容器（`ResizeObserver`）。放在首帧被折叠的
 *     侧栏里时容器高度是 0，只看容器会让列表永远不渲染、尺寸也永远补不上。
 *
 * 组件不猜行高：行内容通过默认插槽渲染，由宿主在挂载/变化时调用 `measure(height)`；
 * 想完全托管高度也可以直接把 `size` 写进 `items`。
 */
export declare const OjVirtualList: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly VirtualItem[]>;
        required: true;
    };
    /** 未测量行的估算高度（px）。估得越准，首次滚动时的跳动越小。 */
    estimateSize: {
        type: NumberConstructor;
        required: true;
    };
    /** 视口上下各多渲染的行数：滚动时先看到白块再蹦出内容，多半就是少了这一圈。 */
    overscan: {
        type: NumberConstructor;
        default: number;
    };
    /** 视口高度（px）。传 0 表示由容器实际高度决定。 */
    viewportSize: {
        type: NumberConstructor;
        default: number;
    };
    /** 滚动区域的可访问名（"批注列表"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly VirtualItem[]>;
        required: true;
    };
    /** 未测量行的估算高度（px）。估得越准，首次滚动时的跳动越小。 */
    estimateSize: {
        type: NumberConstructor;
        required: true;
    };
    /** 视口上下各多渲染的行数：滚动时先看到白块再蹦出内容，多半就是少了这一圈。 */
    overscan: {
        type: NumberConstructor;
        default: number;
    };
    /** 视口高度（px）。传 0 表示由容器实际高度决定。 */
    viewportSize: {
        type: NumberConstructor;
        default: number;
    };
    /** 滚动区域的可访问名（"批注列表"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
}>> & Readonly<{}>, {
    overscan: number;
    viewportSize: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
