/**
 * 停靠面板的状态机（M3：`OjDockPanel`）。
 *
 * 这些是"用户点完发现不对"的重灾区：浮动完再停靠回到默认侧而不是原侧、
 * 面板被拖出屏幕再也抓不回来、收起后标题栏一起消失导致无法展开。
 * 全都能在 `node --test` 里断言。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FLOAT_DEFAULT_HEIGHT,
  FLOAT_DEFAULT_WIDTH,
  FLOAT_GRAB_STRIP,
  clampFloatRect,
  createDockState,
  dockTo,
  isFloating,
  moveFloat,
  redock,
  resizeFloat,
  toggleCollapsed,
  undock,
} from '../src/index.ts'

const VIEWPORT = { width: 1200, height: 800 }

test('初始状态：默认停靠右侧，浮动矩形有合法默认值', () => {
  const state = createDockState()
  assert.equal(state.side, 'right')
  assert.equal(state.docked, 'right')
  assert.equal(state.collapsed, false)
  assert.deepEqual(state.float, { x: 0, y: 0, width: FLOAT_DEFAULT_WIDTH, height: FLOAT_DEFAULT_HEIGHT })

  // 直接以浮动态开局：没有"上次停靠侧"可继承，落到 right
  assert.equal(createDockState({ side: 'floating' }).docked, 'right')
  // 部分字段也不能把矩形算成 NaN
  const partial = createDockState({ float: { width: 400 } })
  assert.equal(partial.float.width, 400)
  assert.equal(partial.float.height, FLOAT_DEFAULT_HEIGHT)
})

test('收起与展开：只切一个标志，标题栏留在原地', () => {
  const state = createDockState()
  const collapsed = toggleCollapsed(state)
  assert.equal(collapsed.collapsed, true)
  assert.equal(collapsed.side, 'right')
  assert.equal(toggleCollapsed(collapsed).collapsed, false)
})

test('停靠/浮动：浮动完再停靠回到原侧，而不是默认侧', () => {
  const left = dockTo(createDockState(), 'left')
  assert.equal(left.side, 'left')
  assert.equal(left.docked, 'left')
  // 已经在该侧：返回原对象，宿主不会收到无变化的更新
  assert.equal(dockTo(left, 'left'), left)

  const floating = undock(left)
  assert.equal(isFloating(floating), true)
  assert.equal(floating.docked, 'left')
  assert.equal(undock(floating), floating)

  // 关键：回到 left，不是 right
  assert.equal(redock(floating).side, 'left')
  // 已经在停靠态时 redock 不动
  assert.equal(redock(left), left)

  // 浮动态下直接停靠另一侧，也要更新"上次停靠侧"
  assert.equal(dockTo(floating, 'bottom').docked, 'bottom')
})

test('浮动位置：夹回"抓得住"的范围，停靠态下移动无效', () => {
  const state = undock(createDockState({ float: { x: 100, y: 100 } }))
  const moved = moveFloat(state, { x: 200, y: 300 }, VIEWPORT)
  assert.equal(moved.float.x, 200)
  assert.equal(moved.float.y, 300)
  // 位置没变就返回原对象
  assert.equal(moveFloat(moved, { x: 200, y: 300 }, VIEWPORT), moved)

  // 往左拖出屏幕：左边缘最多到"只剩一条标题栏"
  const offLeft = moveFloat(state, { x: -9999, y: 100 }, VIEWPORT)
  assert.equal(offLeft.float.x, FLOAT_GRAB_STRIP - FLOAT_DEFAULT_WIDTH)

  // 往右拖出屏幕：面板仍要露出抓取条
  const offRight = moveFloat(state, { x: 9999, y: 100 }, VIEWPORT)
  assert.equal(offRight.float.x, VIEWPORT.width - FLOAT_GRAB_STRIP)

  // 标题栏不能被顶到视口上方，否则连拖动入口都没有
  assert.equal(moveFloat(state, { x: 0, y: -50 }, VIEWPORT).float.y, 0)
  assert.equal(moveFloat(state, { x: 0, y: 9999 }, VIEWPORT).float.y, VIEWPORT.height - FLOAT_GRAB_STRIP)

  // 停靠态的位置由容器决定，改它没有意义
  const docked = createDockState()
  assert.equal(moveFloat(docked, { x: 10, y: 10 }, VIEWPORT), docked)
})

test('矩形夹取：非法尺寸退回默认值，窄视口不产生交叉边界', () => {
  const rect = clampFloatRect({ x: 0, y: 0, width: Number.NaN, height: -30 }, VIEWPORT)
  assert.equal(rect.width, FLOAT_DEFAULT_WIDTH)
  assert.equal(rect.height, 1)

  // 视口比抓取条还窄（侧边分屏）：上界会掉到"左边缘出界"一侧，仍要保证露出的宽度 ≥ 抓取条，
  // 且区间不能反向（反向会让 x 变成 NaN 或者把面板甩到看不见的地方）
  const narrow = clampFloatRect({ x: 500, y: 500, width: 300, height: 200 }, { width: 20, height: 10 })
  assert.equal(narrow.x, 20 - FLOAT_GRAB_STRIP)
  assert.equal(narrow.y, 0)
})

test('浮动尺寸：按上下界夹取，未变化时引用不变', () => {
  const state = undock(createDockState({ float: { width: 400, height: 500 } }))
  const smaller = resizeFloat(state, { width: 100, height: 50 })
  assert.equal(smaller.float.width, 240)
  assert.equal(smaller.float.height, 160)

  const bigger = resizeFloat(state, { width: 2000, height: 2000 }, { maxWidth: 900, maxHeight: 700 })
  assert.equal(bigger.float.width, 900)
  assert.equal(bigger.float.height, 700)

  // 位置不能因为改尺寸被顺手改掉
  const moved = undock(createDockState({ float: { x: 120, y: 80 } }))
  const resized = resizeFloat(moved, { width: 500, height: 600 })
  assert.equal(resized.float.x, 120)
  assert.equal(resized.float.y, 80)

  assert.equal(resizeFloat(state, { width: 400, height: 500 }), state)
})
