/**
 * 分栏拖拽模型（03 §3 D 组 `OjSplitter`）。
 *
 * 只建模"尺寸怎么变"，不建模"谁在拖"：指针事件在组件里，边界与折叠规则在这里。
 * 分开的理由很实际——拖拽的边界 bug 全在 `min`/`max`/折叠三者的交界处，
 * 而浏览器里复现"拖到只剩 3px"要精确到像素；纯函数里一行就能断言。
 *
 * 尺寸指的是**分隔条之后那一栏**的尺寸（右侧/下方）。这个方向约定必须写死：
 * 同一根条子在"左边栏收起"和"右边栏展开"两种语义下方向相反，两种都支持就等于永远搞不清往哪拖。
 */
export interface PaneBounds {
    readonly min: number;
    /** 上限；不写（或写 `Infinity`）表示不设上限。 */
    readonly max?: number;
    /** 允许折叠到 0：拖过 `min` 的一半就认为用户想收起（Word 的侧栏行为）。 */
    readonly collapsible?: boolean;
}
/** 键盘一次步进（px）。与 `--oj-space-4` 同量级，不是随手写的数。 */
export declare const SPLITTER_STEP = 16;
/**
 * 夹进 `[min, max]`；`collapsible` 时低于 `min / 2` 归 0。
 *
 * 折叠阈值取 `min / 2` 而不是 0 或 min：阈值等于 min 时"想拖窄一点"会被判成折叠，
 * 等于 0 时永远折叠不了（鼠标到 0 之前已经到 min）。一半是唯一能让两种意图都成立的界线。
 *
 * `max` 为 `Infinity`（或没给）表示**不设上限**，不能当成"缺省 = min"：
 * 那样"右侧批注栏最宽不限"会被夹成最小宽度，拖一下就弹回去，看起来像拖拽坏了。
 * `max` 小于 `min`（配置写反）时以 `min` 为准：宁可显示最小宽，也不要让栏宽变成 `NaN`。
 */
export declare function clampPane(size: number, bounds: PaneBounds): number;
/**
 * 拖拽中的新尺寸。`delta` 是"这一栏要变宽多少"（向右拖左侧栏变大即正）。
 * 已经折叠（0）的栏在拖拽中不自动展开：展开走键盘或拖回 `min` 以上，避免手抖一下就弹回来。
 */
export declare function resizePane(start: number, delta: number, bounds: PaneBounds): number;
/**
 * 键盘步进。折叠态下按"变大"直接回到 `min`（否则 `0 + 16` 会停在折叠区里出不来）。
 *
 * 反向的边界单独处理：已经在 `min` 上再按"变小"必须折叠到 0。走 `clampPane` 的话
 * `min - 16` 大于 `min / 2`，会被夹回 `min`——键盘就**永远收不起侧栏**，
 * 而拖拽能收，于是同一个组件的两条输入路径行为不一致。
 */
export declare function stepPane(size: number, direction: 1 | -1, bounds: PaneBounds, step?: number): number;
/** 折叠/展开切换。不可折叠时返回原尺寸——按钮仍可在，但点了没反应比"变成 0 就回不来"好。 */
export declare function togglePane(size: number, bounds: PaneBounds): number;
/** 多栏容器里的一栏（03 §3 D 组 `OjPaneGroup`）。 */
export interface PaneSpec {
    readonly id: string;
    /** 该栏尺寸（px）。`flexible` 时无意义，由剩余空间决定。 */
    readonly size: number;
    readonly min?: number;
    readonly max?: number;
    readonly collapsible?: boolean;
    /** 吸收剩余空间（`flex: 1`）。同组多于一个时它们平分剩余空间。 */
    readonly flexible?: boolean;
    /** 是否允许拖拽调整；`false` 时相邻分隔条不渲染（固定宽的工具条栏）。 */
    readonly resizable?: boolean;
    /** 分隔条的可访问名（"调整大纲栏宽度"），由宿主按语言给。 */
    readonly label?: string;
}
export interface PaneSplitter {
    /** 这根分隔条调的是哪一栏。 */
    readonly controlled: string;
    /** 被调的是分隔条**之前**还是**之后**那一栏——决定拖拽与方向键的正负。 */
    readonly side: 'before' | 'after';
}
/**
 * 第 `index` 栏左侧那根分隔条归谁管。`index` 是"后一栏"的下标，所以从 1 开始。
 *
 * 规则：**总是调固定宽的那一栏**。可伸缩栏的尺寸是"剩下的空间"，没有独立数值可拖，
 * 让它当被调对象只会出现"拖动后跳回原处"。两侧都固定时才调后一栏（与 `OjSplitter` 的默认一致）。
 * 两侧都 `flexible` 时返回 `undefined`：它们按比例分空间，拖谁都表达不成单个尺寸。
 */
export declare function paneSplitter(panes: readonly PaneSpec[], index: number): PaneSplitter | undefined;
