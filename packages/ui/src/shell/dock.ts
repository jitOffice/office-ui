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

export const DOCKED_SIDES = ['left', 'right', 'bottom'] as const
export type DockedSide = (typeof DOCKED_SIDES)[number]
export type DockSide = DockedSide | 'floating'

export interface FloatRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface DockViewport {
  readonly width: number
  readonly height: number
}

export interface DockState {
  readonly side: DockSide
  /** 上次停靠的那一侧：从浮动回来时用。 */
  readonly docked: DockedSide
  readonly collapsed: boolean
  /** 浮动矩形；停靠时也保留，重新浮出时回到原来的位置。 */
  readonly float: FloatRect
}

export interface FloatLimits {
  readonly minWidth?: number
  readonly minHeight?: number
  readonly maxWidth?: number
  readonly maxHeight?: number
}

export const FLOAT_DEFAULT_WIDTH = 320
export const FLOAT_DEFAULT_HEIGHT = 480
export const FLOAT_MIN_WIDTH = 240
export const FLOAT_MIN_HEIGHT = 160

/**
 * 浮动面板必须露在视口里的宽度。
 *
 * 取标题栏宽度而不是"整个面板可见"：面板可以大半移出屏幕，但抓得住的那一条必须留着，
 * 否则鼠标一松手就再也拿不回来——这类"窗口飘走了"的 bug 只能靠约束位置来防。
 */
export const FLOAT_GRAB_STRIP = 48

function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback
}

function between(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export interface DockStateOptions {
  readonly side?: DockSide
  readonly collapsed?: boolean
  readonly float?: Partial<FloatRect>
}

/** 初始状态。`side` 为 `floating` 时 `docked` 落到 `right`（没有更好的默认值）。 */
export function createDockState(options: DockStateOptions = {}): DockState {
  const side = options.side ?? 'right'
  const float = options.float ?? {}
  return {
    side,
    docked: side === 'floating' ? 'right' : side,
    collapsed: options.collapsed === true,
    float: {
      x: finite(float.x, 0),
      y: finite(float.y, 0),
      width: Math.max(1, finite(float.width, FLOAT_DEFAULT_WIDTH)),
      height: Math.max(1, finite(float.height, FLOAT_DEFAULT_HEIGHT)),
    },
  }
}

export function isFloating(state: DockState): boolean {
  return state.side === 'floating'
}

/** 收起只是不画内容，标题栏必须留着——否则收起的面板就再也点不开了。 */
export function toggleCollapsed(state: DockState): DockState {
  return { ...state, collapsed: !state.collapsed }
}

/** 停靠到某一侧。已经停在该侧时返回原对象，避免宿主收到无变化的更新。 */
export function dockTo(state: DockState, side: DockedSide): DockState {
  if (state.side === side && state.docked === side) return state
  return { ...state, side, docked: side }
}

/** 浮出。保留 `docked`，`float` 矩形也原样带回。 */
export function undock(state: DockState): DockState {
  if (state.side === 'floating') return state
  return { ...state, side: 'floating' }
}

/** 回到上次停靠的那一侧（不是默认那一侧）。 */
export function redock(state: DockState): DockState {
  if (state.side !== 'floating') return state
  return { ...state, side: state.docked }
}

/**
 * 把浮动矩形夹回"抓得住"的范围。
 *
 * 横向允许左边缘移出到只剩一条标题栏（`FLOAT_GRAB_STRIP`），纵向不允许上边缘出界：
 * 标题栏被顶到视口上方时连拖动入口都没有了。
 */
export function clampFloatRect(rect: FloatRect, viewport: DockViewport): FloatRect {
  const width = Math.max(1, finite(rect.width, FLOAT_DEFAULT_WIDTH))
  const height = Math.max(1, finite(rect.height, FLOAT_DEFAULT_HEIGHT))
  const minX = FLOAT_GRAB_STRIP - width
  // 视口比"抓取条"还窄时（窄窗口、侧边分屏），上下界会交叉，取 min 侧为准
  const maxX = Math.max(minX, finite(viewport.width, 0) - FLOAT_GRAB_STRIP)
  const maxY = Math.max(0, finite(viewport.height, 0) - FLOAT_GRAB_STRIP)
  return {
    x: between(finite(rect.x, 0), minX, maxX),
    y: between(finite(rect.y, 0), 0, maxY),
    width,
    height,
  }
}

/** 移动浮动面板。停靠态下调用返回原对象：位置由容器决定，改它没有意义。 */
export function moveFloat(
  state: DockState,
  position: { x: number; y: number },
  viewport: DockViewport,
): DockState {
  if (!isFloating(state)) return state
  const next = clampFloatRect({ ...state.float, x: position.x, y: position.y }, viewport)
  if (next.x === state.float.x && next.y === state.float.y) return state
  return { ...state, float: next }
}

/** 改浮动尺寸（宿主可接八向手柄）。上下界取 `limits`，没有就给默认最小值、上限不设。 */
export function resizeFloat(state: DockState, size: { width: number; height: number }, limits: FloatLimits = {}): DockState {
  const minWidth = Math.max(1, finite(limits.minWidth, FLOAT_MIN_WIDTH))
  const minHeight = Math.max(1, finite(limits.minHeight, FLOAT_MIN_HEIGHT))
  const maxWidth = Math.max(minWidth, finite(limits.maxWidth, Number.POSITIVE_INFINITY))
  const maxHeight = Math.max(minHeight, finite(limits.maxHeight, Number.POSITIVE_INFINITY))
  const width = between(finite(size.width, state.float.width), minWidth, maxWidth)
  const height = between(finite(size.height, state.float.height), minHeight, maxHeight)
  if (width === state.float.width && height === state.float.height) return state
  return { ...state, float: { ...state.float, width, height } }
}
