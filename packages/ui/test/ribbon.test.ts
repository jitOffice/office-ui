import assert from 'node:assert/strict'
import test from 'node:test'

import { packRibbon, ribbonProbeSize, ribbonSmallerSize } from '../src/index.ts'
import type { RibbonItemSpec, RibbonPackItem } from '../src/index.ts'

/**
 * `OjRibbonGroup` 的布局规则（03 §3 B 组）。
 *
 * 钉死的是三条容易被"看起来对"的实现蒙过去的东西：
 * 降级的**先后次序**、溢出的**顺序稳定**、以及 `»` 自己**占的位置**。
 */

function ids(items: { id: string }[]): string[] {
  return items.map((item) => item.id)
}

test('空组不占宽度', () => {
  assert.deepEqual(packRibbon([], 100), { visible: [], overflow: [], used: 0 })
})

test('放得下就原样显示，不降级也不溢出', () => {
  const items: RibbonPackItem[] = [
    { id: 'bold', size: 'large', width: 32 },
    { id: 'italic', size: 'medium', width: 24 },
    { id: 'underline', size: 'small', width: 16 },
  ]
  const result = packRibbon(items, 32 + 24 + 16 + 4)

  assert.deepEqual(ids(result.visible), ['bold', 'italic', 'underline'])
  assert.deepEqual(
    result.visible.map((item) => item.display),
    ['large', 'medium', 'small'],
  )
  assert.deepEqual(result.overflow, [])
  assert.equal(result.used, 76)
})

test('差一点就降级，降到位即停，不把后面的项一起拖下去', () => {
  const items: RibbonPackItem[] = [
    { id: 'paste', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
    { id: 'copy', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  ]

  // 202 直到降成 122 还超过 110，A 只能再降一档，B 停在 medium
  const tight = packRibbon(items, 110)
  assert.deepEqual(
    tight.visible.map((item) => item.display),
    ['small', 'medium'],
  )
  assert.deepEqual(tight.overflow, [])
  assert.equal(tight.used, 102)

  // 刚好装下"两项都降到 medium"的 122：降完就停，不再往下推
  const partial = packRibbon(items, 122)
  assert.deepEqual(
    partial.visible.map((item) => item.display),
    ['medium', 'medium'],
  )
  assert.equal(partial.used, 122)
})

test('降级按顺序推进：第一轮全体 large→medium，第二轮才从头降 small', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
    { id: 'b', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  ]
  const result = packRibbon(items, 110)

  // 从头降第二轮：a 先降 small，b 仍是 medium —— 位置与尺寸都比"顺序打乱"可预期
  assert.deepEqual(
    result.visible.map((item) => item.display),
    ['small', 'medium'],
  )
})

test('没量过降级后的宽度就不假装降级有效：直接走溢出', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'large', width: 100 },
    { id: 'b', size: 'medium', width: 100 },
  ]
  const result = packRibbon(items, 150)

  // 降了尺寸但宽度没变，等于没降；只能靠溢出
  assert.deepEqual(ids(result.visible), ['a'])
  assert.deepEqual(ids(result.overflow), ['b'])
  assert.deepEqual(
    result.overflow.map((item) => item.display),
    ['small'],
  )
})

test('溢出从末尾拿，顺序不乱，降级结果跟着进菜单', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
    { id: 'b', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
    { id: 'c', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  ]
  const result = packRibbon(items, 90)

  assert.deepEqual(ids(result.visible), ['a'])
  assert.deepEqual(ids(result.overflow), ['b', 'c'])
  // 溢出项保留降级后的尺寸，菜单里才不会忽大忽小
  assert.deepEqual(
    result.overflow.map((item) => item.display),
    ['small', 'small'],
  )
  assert.equal(result.used, 40 + 2 + 20)
})

test('`»` 自己的宽度必须预留，否则溢出按钮会被挤出容器', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'medium', width: 100 },
    { id: 'b', size: 'medium', width: 100 },
  ]

  // 202 是"不带 `»` 时的满宽"：多 1px 就只能进溢出
  const result = packRibbon(items, 201)
  assert.deepEqual(ids(result.visible), ['a'])
  assert.deepEqual(ids(result.overflow), ['b'])
  // used 含 `»` 与它的间距：100 + 2 + 20
  assert.equal(result.used, 122)
  assert.ok(result.used <= 201)
})

test('连一项都放不下时可见区为空，只留 `»`', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
    { id: 'b', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  ]
  const result = packRibbon(items, 50)

  assert.deepEqual(result.visible, [])
  assert.deepEqual(ids(result.overflow), ['a', 'b'])
  assert.equal(result.used, 20)
})

test('不改写入参：降级只发生在返回的新对象上', () => {
  const items: RibbonPackItem[] = [{ id: 'a', size: 'large', width: 100 }]
  const result = packRibbon(items, 10)

  assert.deepEqual(items, [{ id: 'a', size: 'large', width: 100 }])
  assert.notEqual(result.overflow[0], items[0])
})

test('任意宽度下：顺序守恒、可见区占用不超出容器的承诺能兑现', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'large', width: 90, widths: { medium: 50, small: 30 } },
    { id: 'b', size: 'medium', width: 70, widths: { small: 40 } },
    { id: 'c', size: 'small', width: 30 },
    { id: 'd', size: 'large', width: 90, widths: { medium: 50, small: 30 } },
  ]

  for (let available = 0; available <= 400; available += 7) {
    const result = packRibbon(items, available)
    assert.deepEqual([...ids(result.visible), ...ids(result.overflow)], ids(items), `宽度 ${available} 时顺序被打乱`)
    // 只要还留得下一项，整组（含 `»`）就不能超出容器
    if (result.visible.length > 0) {
      assert.ok(result.used <= available, `宽度 ${available} 时 used=${result.used} 溢出容器`)
    }
  }
})

test('gap 与 overflowWidth 可配置，且影响判定的边界', () => {
  const items: RibbonPackItem[] = [
    { id: 'a', size: 'medium', width: 100 },
    { id: 'b', size: 'medium', width: 100 },
  ]

  // gap=0：正好 200 装得下
  assert.deepEqual(packRibbon(items, 200, { gap: 0 }).overflow, [])
  // gap=10：210 才装得下
  assert.equal(packRibbon(items, 205, { gap: 10 }).overflow.length, 1)
  // `»` 更宽时能留下的可见项更少
  assert.deepEqual(ids(packRibbon(items, 190, { gap: 0, overflowWidth: 150 }).overflow), ['a', 'b'])
})

test('自动量宽：先探 medium，量到之后才要求 small', () => {
  const items: RibbonItemSpec[] = [
    { id: 'a', size: 'large' },
    { id: 'b', size: 'large' },
  ]

  // 第一档宽度是渲染出来就有的，不用"探"；缺的是更小那两档
  assert.equal(ribbonProbeSize(items, {}), 'medium')
  // 量到 medium 之后，large→small 这一跳还没量
  assert.equal(ribbonProbeSize(items, { a: { medium: 60 }, b: { medium: 60 } }), 'small')
  // 两档都量到就没有可探的了
  assert.equal(
    ribbonProbeSize(items, { a: { medium: 60, small: 40 }, b: { medium: 60, small: 40 } }),
    undefined,
  )
})

test('自动量宽：显式给过 width / widths 的项不再要求探测', () => {
  const explicit: RibbonItemSpec[] = [
    { id: 'a', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  ]
  assert.equal(ribbonProbeSize(explicit, {}), undefined)

  // 只给了设计尺寸的宽度：medium 还得量一次
  const half: RibbonItemSpec[] = [{ id: 'b', size: 'large', width: 100 }]
  assert.equal(ribbonProbeSize(half, {}), 'medium')
})

test('自动量宽：不会去探比自身更小的档（small 项没有下一跳）', () => {
  const items: RibbonItemSpec[] = [
    { id: 'a', size: 'small' },
    { id: 'b', size: 'medium' },
  ]
  // medium 项自己那一档由首帧渲染直接量到，缺的只有 small
  assert.equal(ribbonProbeSize(items, {}), 'small')
  assert.equal(ribbonProbeSize([{ id: 'a', size: 'small' }], {}), undefined)
})

test('ribbonSmallerSize 只会往下压', () => {
  assert.equal(ribbonSmallerSize('large', 'medium'), 'medium')
  assert.equal(ribbonSmallerSize('small', 'large'), 'small')
  assert.equal(ribbonSmallerSize('medium', 'medium'), 'medium')
})
