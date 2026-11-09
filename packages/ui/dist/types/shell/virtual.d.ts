/**
 * 变高虚拟列表（03 §3 D 组 `OjVirtualList`）。
 *
 * 三件事必须在这里算清楚，放进组件就再也测不了：
 *   - **前缀和**。变高列表的"第 i 行在哪个位置"只能是累加结果；每次滚动都重算全表是
 *     十万行列表掉帧的来源，所以测量只改被量那一行之后的偏移。
 *   - **锚点稳定**。往上方插入内容时（新批注落到列表顶部），`scrollTop` 不变而内容整体下移，
 *     用户眼前那行就跳走了。正确做法是记住"视口顶部那一行 + 它被滚过去了多少"，
 *     数据更新后把这个偏移还原回去。
 *   - **零高度视口也要渲染至少一行**。容器还没量到尺寸（首帧、被折叠的侧栏）时，
 *     若按 `visibleRange(scrollTop, 0)` 返回空窗口，行就永远没机会被测量，尺寸永远补不上。
 */
export interface VirtualItem {
    readonly id: string;
    /** 已知高度；未测量时退回估算值。 */
    readonly size?: number;
}
export interface VirtualMetrics {
    readonly ids: readonly string[];
    readonly sizes: readonly number[];
    /** 前缀和，长度 = `ids.length + 1`；最后一项就是总高度。 */
    readonly offsets: readonly number[];
    readonly total: number;
}
export interface VisibleWindow {
    readonly start: number;
    /** 开区间：渲染 `items.slice(start, end)`。 */
    readonly end: number;
    /** 窗口上方被折叠掉的高度（用 `translateY` 或 spacer 呈现）。 */
    readonly padTop: number;
    readonly padBottom: number;
}
export interface VirtualAnchor {
    readonly id: string;
    /** 该行顶部相对视口顶部的偏移；负数表示这一行已经滚过去一截。 */
    readonly delta: number;
}
export declare function createMetrics(items: readonly VirtualItem[], estimateSize: number): VirtualMetrics;
/**
 * 量到真实高度后重建偏移。
 *
 * 只改 `index` 之后的偏移：前面的行与它们的滚动位置都不受影响，列表才不会在测量时抖动。
 * 尺寸没变时返回原对象——`ResizeObserver` 会在同一帧里反复回调，引用变化会引发无意义的重渲染。
 */
export declare function measureItem(metrics: VirtualMetrics, index: number, size: number): VirtualMetrics;
/**
 * 某个滚动位置落在第几行。
 *
 * 返回的是"顶部已滚过的那一行"，不是"完全可见的第一行"——两者在滚到一半时不同，
 * 锚点与可视窗口用的都是前者。空列表返回 0，调用方靠 `ids.length` 判断空态。
 */
export declare function indexAtOffset(metrics: VirtualMetrics, offset: number): number;
/**
 * 需要渲染的窗口。
 *
 * `overscan` 是上下各多渲染的行数：滚动时先看到"白块"再蹦出内容，多半就是少了这一圈。
 * 高度为 0 的视口仍然返回至少一行（见文件头第 3 条），否则永远量不到真实高度。
 */
export declare function visibleRange(metrics: VirtualMetrics, scrollOffset: number, viewportSize: number, overscan?: number): VisibleWindow;
/** 滚动位置夹进合法范围：内容比视口还短时只能停在 0。 */
export declare function clampScrollOffset(offset: number, metrics: VirtualMetrics, viewportSize: number): number;
/** 记住"视口顶部是哪一行、被滚过去了多少"，供数据更新后还原。空列表没有锚点。 */
export declare function anchorAt(metrics: VirtualMetrics, scrollOffset: number): VirtualAnchor | undefined;
/**
 * 数据更新后要还原到的滚动位置。
 *
 * 锚点行被删掉时返回 `undefined`——猜一个位置会让用户从"读第 3 条"跳到"第 1 条"，
 * 保持当前滚动位置反而是唯一不突兀的选择。调用方负责再夹一次范围。
 */
export declare function scrollTopForAnchor(metrics: VirtualMetrics, anchor: VirtualAnchor): number | undefined;
