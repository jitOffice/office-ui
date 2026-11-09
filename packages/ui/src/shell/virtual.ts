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
  readonly id: string
  /** 已知高度；未测量时退回估算值。 */
  readonly size?: number
}

export interface VirtualMetrics {
  readonly ids: readonly string[]
  readonly sizes: readonly number[]
  /** 前缀和，长度 = `ids.length + 1`；最后一项就是总高度。 */
  readonly offsets: readonly number[]
  readonly total: number
}

export interface VisibleWindow {
  readonly start: number
  /** 开区间：渲染 `items.slice(start, end)`。 */
  readonly end: number
  /** 窗口上方被折叠掉的高度（用 `translateY` 或 spacer 呈现）。 */
  readonly padTop: number
  readonly padBottom: number
}

export interface VirtualAnchor {
  readonly id: string
  /** 该行顶部相对视口顶部的偏移；负数表示这一行已经滚过去一截。 */
  readonly delta: number
}

/** 非法尺寸一律当 0：`NaN` 混进前缀和会让整张表的偏移全部变成 `NaN`，且再也恢复不了。 */
function positive(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return Math.max(0, fallback)
  return Math.max(0, value)
}

export function createMetrics(items: readonly VirtualItem[], estimateSize: number): VirtualMetrics {
  const estimate = positive(estimateSize, 0)
  const ids: string[] = []
  const sizes: number[] = []
  const offsets: number[] = [0]
  for (const item of items) {
    ids.push(item.id)
    const size = positive(item.size, estimate)
    sizes.push(size)
    offsets.push((offsets[offsets.length - 1] as number) + size)
  }
  return { ids, sizes, offsets, total: offsets[offsets.length - 1] as number }
}

/**
 * 量到真实高度后重建偏移。
 *
 * 只改 `index` 之后的偏移：前面的行与它们的滚动位置都不受影响，列表才不会在测量时抖动。
 * 尺寸没变时返回原对象——`ResizeObserver` 会在同一帧里反复回调，引用变化会引发无意义的重渲染。
 */
export function measureItem(metrics: VirtualMetrics, index: number, size: number): VirtualMetrics {
  const current = metrics.sizes[index]
  if (current === undefined) return metrics
  const next = positive(size, current)
  if (next === current) return metrics
  const delta = next - current
  const sizes = metrics.sizes.slice()
  sizes[index] = next
  const offsets = metrics.offsets.slice()
  for (let cursor = index + 1; cursor < offsets.length; cursor += 1) {
    offsets[cursor] = (offsets[cursor] as number) + delta
  }
  return { ids: metrics.ids, sizes, offsets, total: metrics.total + delta }
}

/**
 * 某个滚动位置落在第几行。
 *
 * 返回的是"顶部已滚过的那一行"，不是"完全可见的第一行"——两者在滚到一半时不同，
 * 锚点与可视窗口用的都是前者。空列表返回 0，调用方靠 `ids.length` 判断空态。
 */
export function indexAtOffset(metrics: VirtualMetrics, offset: number): number {
  const count = metrics.ids.length
  if (count === 0) return 0
  const value = Number.isFinite(offset) ? offset : 0
  if (value <= 0) return 0
  if (value >= metrics.total) return count - 1
  let low = 0
  let high = count - 1
  while (low < high) {
    // 上取整，避免 low+1 === high 时死循环
    const middle = Math.ceil((low + high) / 2)
    if ((metrics.offsets[middle] as number) <= value) low = middle
    else high = middle - 1
  }
  return low
}

/**
 * 需要渲染的窗口。
 *
 * `overscan` 是上下各多渲染的行数：滚动时先看到"白块"再蹦出内容，多半就是少了这一圈。
 * 高度为 0 的视口仍然返回至少一行（见文件头第 3 条），否则永远量不到真实高度。
 */
export function visibleRange(
  metrics: VirtualMetrics,
  scrollOffset: number,
  viewportSize: number,
  overscan = 0,
): VisibleWindow {
  const count = metrics.ids.length
  if (count === 0) return { start: 0, end: 0, padTop: 0, padBottom: 0 }

  const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0)
  const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0)
  const buffer = Math.max(0, Math.floor(Number.isFinite(overscan) ? overscan : 0))

  const start = Math.max(0, indexAtOffset(metrics, offset) - buffer)
  // 视口底边落在哪一行；`end` 是开区间，所以要 +1
  const end = Math.min(count, indexAtOffset(metrics, offset + viewport) + 1 + buffer)
  return {
    start,
    end: Math.max(start, end),
    padTop: metrics.offsets[start] as number,
    padBottom: metrics.total - (metrics.offsets[end] as number),
  }
}

/** 滚动位置夹进合法范围：内容比视口还短时只能停在 0。 */
export function clampScrollOffset(offset: number, metrics: VirtualMetrics, viewportSize: number): number {
  const viewport = Math.max(0, Number.isFinite(viewportSize) ? viewportSize : 0)
  const max = Math.max(0, metrics.total - viewport)
  const value = Number.isFinite(offset) ? offset : 0
  return Math.min(Math.max(0, value), max)
}

/** 记住"视口顶部是哪一行、被滚过去了多少"，供数据更新后还原。空列表没有锚点。 */
export function anchorAt(metrics: VirtualMetrics, scrollOffset: number): VirtualAnchor | undefined {
  if (metrics.ids.length === 0) return undefined
  const offset = Math.max(0, Number.isFinite(scrollOffset) ? scrollOffset : 0)
  const index = indexAtOffset(metrics, offset)
  const id = metrics.ids[index]
  if (id === undefined) return undefined
  return { id, delta: offset - (metrics.offsets[index] as number) }
}

/**
 * 数据更新后要还原到的滚动位置。
 *
 * 锚点行被删掉时返回 `undefined`——猜一个位置会让用户从"读第 3 条"跳到"第 1 条"，
 * 保持当前滚动位置反而是唯一不突兀的选择。调用方负责再夹一次范围。
 */
export function scrollTopForAnchor(metrics: VirtualMetrics, anchor: VirtualAnchor): number | undefined {
  const index = metrics.ids.indexOf(anchor.id)
  if (index < 0) return undefined
  return (metrics.offsets[index] as number) + anchor.delta
}
