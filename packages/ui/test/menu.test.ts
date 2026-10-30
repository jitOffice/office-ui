import assert from 'node:assert/strict'
import test from 'node:test'

import { menuAction, menuNeighbor, menuSelectable, menuSelectableIndices } from '../src/index.ts'
import type { OjMenuItem } from '../src/index.ts'

/**
 * `OjContextMenu` 的键盘模型（03 §3 B 组、§5）。
 *
 * 这几条规则单独测的原因是它们**只能靠手感发现**：菜单卡在最后一项、
 * 上下键停在分隔线上、全禁用时按回车炸掉——三类 bug 都不会报错，只会让人觉得"这个菜单有点怪"。
 */

const items: OjMenuItem[] = [
  { id: 'cut', label: '剪切' },
  { id: 'copy', label: '复制' },
  { id: 'paste', label: '粘贴', disabled: true },
  { kind: 'separator' },
  { id: 'table', label: '插入表格' },
  { id: 'delete', label: '删除', danger: true, separatorBefore: true },
]

test('分隔线与禁用项不可选，可选项下标按原顺序', () => {
  assert.deepEqual(menuSelectableIndices(items), [0, 1, 4, 5])
  assert.equal(menuSelectable(items[2] as OjMenuItem), false)
  assert.equal(menuSelectable(items[3] as OjMenuItem), false)
  assert.equal(menuSelectable(items[4] as OjMenuItem), true)
})

test('无聚焦时 ArrowDown 落到第一个可选项，ArrowUp 落到最后一个', () => {
  assert.equal(menuNeighbor(items, -1, 'ArrowDown'), 0)
  assert.equal(menuNeighbor(items, -1, 'ArrowUp'), 5)
})

test('上下键跳过禁用项与分隔线，并在首尾**环绕**', () => {
  assert.equal(menuNeighbor(items, 0, 'ArrowDown'), 1)
  assert.equal(menuNeighbor(items, 1, 'ArrowDown'), 4, '应跳过禁用的 paste 与分隔线')
  assert.equal(menuNeighbor(items, 5, 'ArrowDown'), 0, '最后一项按下应回到第一项')
  assert.equal(menuNeighbor(items, 0, 'ArrowUp'), 5, '第一项按上应到最后一个可选项')
})

test('Home / End 跳到首尾可选项，不是首尾项', () => {
  assert.equal(menuNeighbor(items, 4, 'Home'), 0)
  assert.equal(menuNeighbor(items, 0, 'End'), 5)
})

test('不认识的键原样返回当前下标，调用方据此判断这个键不归它管', () => {
  assert.equal(menuNeighbor(items, 4, 'a'), 4)
  assert.equal(menuNeighbor(items, -1, 'PageDown'), -1)
})

test('全部禁用或只有分隔线时返回 -1，不会返回一个点不着的下标', () => {
  const dead: OjMenuItem[] = [
    { id: 'a', disabled: true },
    { kind: 'separator' },
    { id: 'b', disabled: true },
  ]
  for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
    assert.equal(menuNeighbor(dead, -1, key), -1, key)
  }
  assert.equal(menuNeighbor([], -1, 'ArrowDown'), -1)
})

test('回车只对可选项生效：无聚焦、落在禁用项或分隔线上都返回 undefined', () => {
  assert.equal(menuAction(items, 0)?.id, 'cut')
  assert.equal(menuAction(items, -1), undefined)
  assert.equal(menuAction(items, 2), undefined, '禁用项')
  assert.equal(menuAction(items, 3), undefined, '分隔线')
  assert.equal(menuAction(items, 99), undefined, '越界')
})

test('菜单项的下标是**原数组下标**，不是可选项序号：组件靠它定位 DOM 节点', () => {
  // 这条看着像废话，但 roving tabindex 正是"用可选项序号去查 DOM"时才会踩的坑
  const next = menuNeighbor(items, 1, 'ArrowDown')
  assert.equal(next, 4)
  assert.equal(menuAction(items, next)?.id, 'table')
})
