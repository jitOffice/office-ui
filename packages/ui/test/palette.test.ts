import assert from 'node:assert/strict'
import test from 'node:test'

import { filterPaletteItems, paletteScore, paletteStep } from '../src/index.ts'
import type { OjPaletteItem } from '../src/index.ts'

/**
 * 命令面板的搜索排序（03 §3 B 组 `OjCommandPalette`）。
 *
 * 这里不是"过滤掉不匹配的"那么简单：同一个词通常能命中十几条，
 * 决定用户能不能回车一次搞定的是**谁排第一**。
 */

const items: OjPaletteItem[] = [
  { id: 'format.bold', label: '加粗', description: '把选中文字设为粗体', group: '字体', keys: 'mod+b' },
  { id: 'format.italic', label: '斜体', description: '把选中文字设为斜体', group: '字体' },
  { id: 'format.boldStrong', label: '加粗（强调）', group: '字体' },
  { id: 'insert.table', label: '插入表格', group: '插入' },
  { id: 'format.bold.disabled', label: '加粗', disabled: true },
]

test('空查询按原顺序返回全部（命令表顺序本身是设计过的）', () => {
  assert.deepEqual(filterPaletteItems(items, ''), items)
  assert.deepEqual(filterPaletteItems(items, '   '), items)
  assert.equal(paletteScore(items[0]!, ''), 0)
})

test('排序：完全相同 > 开头 > 包含 > id > 说明', () => {
  const exact = paletteScore({ id: 'x', label: '加粗' }, '加粗')!
  const prefix = paletteScore({ id: 'x', label: '加粗（强调）' }, '加粗')!
  const contains = paletteScore({ id: 'x', label: '一键加粗' }, '加粗')!
  const byId = paletteScore({ id: 'format.bold', label: '粗体' }, 'bold')!
  const byDescription = paletteScore({ id: 'x', label: '粗体', description: '加粗显示' }, '加粗')!

  assert.ok(exact > prefix)
  assert.ok(prefix > contains)
  assert.ok(contains > byId)
  assert.ok(byId > byDescription)
})

test('搜索「加粗」：同名两条都命中，按注册顺序稳定排列', () => {
  const result = filterPaletteItems(items, '加粗')

  assert.deepEqual(
    result.map((item) => item.id),
    ['format.bold', 'format.bold.disabled', 'format.boldStrong'],
  )
})

test('英文可以按子序列命中，大小写不敏感', () => {
  const list: OjPaletteItem[] = [
    { id: 'format.bold', label: 'Format Bold' },
    { id: 'format.italic', label: 'Format Italic' },
  ]

  assert.equal(paletteScore(list[0]!, 'FB')! > 0, true)
  assert.deepEqual(filterPaletteItems(list, 'fb').map((item) => item.id), ['format.bold'])
  assert.deepEqual(filterPaletteItems(list, 'bold').map((item) => item.id), ['format.bold'])
})

test('禁用的命令照样能被搜到（能不能执行是注册表的事）', () => {
  const result = filterPaletteItems(items, '强调')
  assert.deepEqual(result.map((item) => item.id), ['format.boldStrong'])
  assert.equal(result[0]!.disabled, undefined)
})

test('没有命中就是空数组', () => {
  assert.deepEqual(filterPaletteItems(items, '不存在的命令'), [])
})

test('上下移动是循环的，坏输入不产生越界下标', () => {
  assert.equal(paletteStep(3, 0, 1), 1)
  assert.equal(paletteStep(3, 2, 1), 0)
  assert.equal(paletteStep(3, 0, -1), 2)
  assert.equal(paletteStep(3, 1, -2), 2)
  assert.equal(paletteStep(0, 5, 1), 0)
  assert.equal(paletteStep(3, Number.NaN, 1), 1)
})
