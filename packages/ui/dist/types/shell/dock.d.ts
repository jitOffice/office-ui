/**
 * 可停靠面板的状态机（03 §3 D 组 `OjDockPanel`）。
 *
 * 面板只有四种位置，但状态里必须同时记住**上次停靠的那一侧**：从"停到左边"浮动出去，
 * 再点"停靠"，用户期望回到左边，而不是被扔回默认的右边。少记这一个字段，
 * 用户每次浮动完都得重新拖一次栏——而且他不会觉得是 bug，只会觉得这面板"难用"。
 *
 * 停靠尺寸**不在这里**：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
 * 这里只管"在哪、是否收起、浮动时占多大一块"。
 */
export declare const DOCKED_SIDES: readonly ['left', 'right', 'bottom'];
export type DockedSide = (typeof DOCKED_SIDES)[number];
export type DockSide = DockedSide | 'floating';
export interface FloatRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
export interface DockViewport {
    readonly width: number;
    readonly height: number;
}
export interface DockState {
    readonly side: DockSide;
    /** 上次停靠的那一侧：从浮动回来时用。 */
    readonly docked: DockedSide;
    readonly collapsed: boolean;
    /** 浮动矩形；停靠时也保留，重新浮出时回到原来的位置。 */
    readonly float: FloatRect;
}
export interface FloatLimits {
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly maxWidth?: number;
    readonly maxHeight?: number;
}
export declare const FLOAT_DEFAULT_WIDTH = 320;
export declare const FLOAT_DEFAULT_HEIGHT = 480;
export declare const FLOAT_MIN_WIDTH = 240;
export declare const FLOAT_MIN_HEIGHT = 160;
/**
 * 浮动面板必须露在视口里的宽度。
 *
 * 取标题栏宽度而不是"整个面板可见"：面板可以大半移出屏幕，但抓得住的那一条必须留着，
 * 否则鼠标一松手就再也拿不回来——这类"窗口飘走了"的 bug 只能靠约束位置来防。
 */
export declare const FLOAT_GRAB_STRIP = 48;
export interface DockStateOptions {
    readonly side?: DockSide;
    readonly collapsed?: boolean;
    readonly float?: Partial<FloatRect>;
}
/** 初始状态。`side` 为 `floating` 时 `docked` 落到 `right`（没有更好的默认值）。 */
export declare function createDockState(options?: DockStateOptions): DockState;
export declare function isFloating(state: DockState): boolean;
/** 收起只是不画内容，标题栏必须留着——否则收起的面板就再也点不开了。 */
export declare function toggleCollapsed(state: DockState): DockState;
/** 停靠到某一侧。已经停在该侧时返回原对象，避免宿主收到无变化的更新。 */
export declare function dockTo(state: DockState, side: DockedSide): DockState;
/** 浮出。保留 `docked`，`float` 矩形也原样带回。 */
export declare function undock(state: DockState): DockState;
/** 回到上次停靠的那一侧（不是默认那一侧）。 */
export declare function redock(state: DockState): DockState;
/**
 * 把浮动矩形夹回"抓得住"的范围。
 *
 * 横向允许左边缘移出到只剩一条标题栏（`FLOAT_GRAB_STRIP`），纵向不允许上边缘出界：
 * 标题栏被顶到视口上方时连拖动入口都没有了。
 */
export declare function clampFloatRect(rect: FloatRect, viewport: DockViewport): FloatRect;
/** 移动浮动面板。停靠态下调用返回原对象：位置由容器决定，改它没有意义。 */
export declare function moveFloat(state: DockState, position: {
    x: number;
    y: number;
}, viewport: DockViewport): DockState;
/** 改浮动尺寸（宿主可接八向手柄）。上下界取 `limits`，没有就给默认最小值、上限不设。 */
export declare function resizeFloat(state: DockState, size: {
    width: number;
    height: number;
}, limits?: FloatLimits): DockState;
