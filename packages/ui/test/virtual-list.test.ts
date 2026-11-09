/**
 * 变高虚拟列表的算法层（M3：`OjVirtualList`）。
 *
 * 这些断言在浏览器里几乎无法稳定复现：滚动到第 137 行、插入一条让上方高度变化、
 * 再检查"用户眼前那行没动"——纯函数里一行就能钉死，组件测试只验接线。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  anchorAt,
  clampScrollOffset,
  createMetrics,
  indexAtOffset,
  measureItem,
  scrollTopForAnchor,
  visibleRange,
} from '../src/index.ts'

const items = (sizes: readonly number[]): { id: string; size: number }[] =>
  sizes.map((size, index) => ({ id: `i${index}`, size }))

test('前缀和：显式高度优先，估算值补齐，非法尺寸归零', () => {
  const metrics = createMetrics([{ id: 'a' }, { id: 'b', size: 80 }, { id: 'c' }], 50)
  assert.deepEqual(metrics.sizes, [50, 80, 50])
  assert.deepEqual(metrics.offsets, [0, 50, 130, 180])
  assert.equal(metrics.total, 180)

  // NaN / 负数混进前缀和会让整张表变成 NaN，且再也恢复不了
  const broken = createMetrics(
    [
      { id: 'a', size: Number.NaN },
      { id: 'b', size: -20 },
    ],
    40,
  )
  assert.deepEqual(broken.sizes, [40, 0])
  assert.equal(broken.total, 40)

  const empty = createMetrics([], 50)
  assert.deepEqual(empty.ids, [])
  assert.equal(empty.total, 0)
})

test('定位：边界落在上一行（顶部已滚过的那一行）', () => {
  const metrics = createMetrics(items([50, 50, 50]), 50)
  assert.equal(indexAtOffset(metrics, -30), 0)
  assert.equal(indexAtOffset(metrics, 0), 0)
  assert.equal(indexAtOffset(metrics, 49), 0)
  assert.equal(indexAtOffset(metrics, 50), 1)
  assert.equal(indexAtOffset(metrics, 100), 2)
  // 超过总高时停在最后一行，不是越界
  assert.equal(indexAtOffset(metrics, 9999), 2)
  // 空列表没有行可指，但也不能返回 -1 让调用方去处理负数
  assert.equal(indexAtOffset(createMetrics([], 50), 10), 0)
})

test('可视窗口：开区间 + overscan；高度为 0 的视口也至少渲染一行', () => {
  const metrics = createMetrics(items([50, 50, 50, 50, 50]), 50)
  assert.deepEqual(visibleRange(metrics, 0, 100), { start: 0, end: 3, padTop: 0, padBottom: 100 })
  assert.deepEqual(visibleRange(metrics, 100, 100), { start: 2, end: 5, padTop: 100, padBottom: 0 })

  // overscan 上下各多一行：滚动时先看到白块再蹦出内容，多半就是少了这一圈
  assert.deepEqual(visibleRange(metrics, 100, 100, 1), { start: 1, end: 5, padTop: 50, padBottom: 0 })

  // 容器还没量到尺寸：返回一行，否则这一行永远没机会被测量，高度永远补不上
  const collapsed = visibleRange(metrics, 0, 0)
  assert.equal(collapsed.end - collapsed.start, 1)

  // 滚到底部时窗口不能越界
  assert.equal(visibleRange(metrics, 250, 100).end, 5)
  assert.deepEqual(visibleRange(createMetrics([], 50), 0, 100), { start: 0, end: 0, padTop: 0, padBottom: 0 })
})

test('测量：只移动被量那一行之后的偏移；尺寸没变时引用不变', () => {
  const metrics = createMetrics(items([50, 50, 50]), 50)
  const measured = measureItem(metrics, 1, 90)
  assert.deepEqual(measured.sizes, [50, 90, 50])
  assert.deepEqual(measured.offsets, [0, 50, 140, 190])
  assert.equal(measured.total, 190)
  // 第 0 行不受影响：测量期间上方内容必须纹丝不动，否则列表会抖
  assert.equal(measured.offsets[1], 50)

  // ResizeObserver 会在同一帧反复回调：同值必须返回原对象，避免无意义重渲染
  assert.equal(measureItem(measured, 1, 90), measured)
  // 越界与非法值都不改表
  assert.equal(measureItem(metrics, 9, 90), metrics)
  assert.equal(measureItem(metrics, 0, Number.NaN), metrics)
  // 量到 0 是合法的（行被折叠），不是"没量到"
  assert.equal(measureItem(metrics, 0, 0).sizes[0], 0)
})

test('滚动位置夹取：内容比视口短时只能停在 0', () => {
  const metrics = createMetrics(items([50, 50]), 50)
  assert.equal(clampScrollOffset(-10, metrics, 60), 0)
  assert.equal(clampScrollOffset(20, metrics, 60), 20)
  assert.equal(clampScrollOffset(999, metrics, 60), 40)
  assert.equal(clampScrollOffset(Number.NaN, metrics, 60), 0)
  // 内容比视口短：没有可滚动区间
  assert.equal(clampScrollOffset(30, metrics, 500), 0)
})

test('锚点：上方插入内容后还原滚动位置，锚点行消失则交回当前值', () => {
  const before = createMetrics(items([50, 50, 50]), 50)
  // 滚到 120：顶部已滚过第 2 行 20px
  assert.deepEqual(anchorAt(before, 120), { id: 'i2', delta: 20 })
  assert.deepEqual(anchorAt(before, 0), { id: 'i0', delta: 0 })
  assert.equal(anchorAt(createMetrics([], 50), 10), undefined)

  const inserted = createMetrics([{ id: 'new', size: 50 }, ...items([50, 50, 50])], 50)
  const anchor = anchorAt(before, 120)
  assert.ok(anchor !== undefined)
  // 新行插在顶部，i2 从 100 挪到 150：滚动位置同步 +50，用户眼前那行不动
  assert.equal(scrollTopForAnchor(inserted, anchor), 170)

  // 锚点行被删除：返回 undefined，调用方保持当前滚动位置（猜一个只会让用户从头找）
  const removed = createMetrics(items([50, 50]), 50)
  assert.equal(scrollTopForAnchor(removed, { id: 'missing', delta: 0 }), undefined)
})
