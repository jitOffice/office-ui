import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createRibbonChrome,
  ribbonDismiss,
  ribbonHasKeyTips,
  ribbonKeyTip,
  ribbonPanelOpen,
  ribbonSelect,
  ribbonToggleCollapsed,
} from '../src/index.ts'

/**
 * `OjRibbon` 的选项卡与自动折叠（03 §3 B 组）。
 *
 * 这里钉的是"收起"的三种形态——**固定收起**、**临时展开**、**固定展开**。
 * 把后两者合并成一个布尔，是这类组件最常见的错：用户点一下文档才发现功能区长回来了。
 */

const start = createRibbonChrome('home')

test('初始是固定展开，面板可见，标签记得住', () => {
  assert.deepEqual(start, { tab: 'home', collapsed: false, peek: false })
  assert.equal(ribbonPanelOpen(start), true)
})

test('展开态单击只切标签，不折叠', () => {
  const next = ribbonSelect(start, 'insert')

  assert.equal(next.tab, 'insert')
  assert.equal(next.collapsed, false)
  assert.equal(next.peek, false)
  assert.equal(ribbonPanelOpen(next), true)
})

test('双击标签收起：面板不可见，但标签不被忘掉', () => {
  const selected = ribbonSelect(start, 'insert')
  const collapsed = ribbonToggleCollapsed(selected)

  assert.deepEqual(collapsed, { tab: 'insert', collapsed: true, peek: false })
  assert.equal(ribbonPanelOpen(collapsed), false)

  const restored = ribbonToggleCollapsed(collapsed)
  assert.deepEqual(restored, { tab: 'insert', collapsed: false, peek: false })
  assert.equal(ribbonPanelOpen(restored), true)
})

test('收起态单击标签是"临时展开"，不是永久展开', () => {
  const collapsed = ribbonToggleCollapsed(start)
  const peeked = ribbonSelect(collapsed, 'view')

  assert.deepEqual(peeked, { tab: 'view', collapsed: true, peek: true })
  assert.equal(ribbonPanelOpen(peeked), true)

  const dismissed = ribbonDismiss(peeked)
  assert.deepEqual(dismissed, { tab: 'view', collapsed: true, peek: false })
  assert.equal(ribbonPanelOpen(dismissed), false)
})

test('临时展开时再点同一个标签：收回，而不是重新展开', () => {
  const peeked = ribbonSelect(ribbonToggleCollapsed(start), 'view')
  const again = ribbonSelect(peeked, 'view')

  assert.deepEqual(again, { tab: 'view', collapsed: true, peek: false })
  assert.equal(ribbonPanelOpen(again), false)
})

test('临时展开时点别的标签：换过去并保持临时展开', () => {
  const peeked = ribbonSelect(ribbonToggleCollapsed(start), 'view')
  const moved = ribbonSelect(peeked, 'insert')

  assert.deepEqual(moved, { tab: 'insert', collapsed: true, peek: true })
  assert.equal(ribbonPanelOpen(moved), true)
})

test('临时展开时双击标签：固定展开，临时标志必须清掉', () => {
  const peeked = ribbonSelect(ribbonToggleCollapsed(start), 'view')
  const pinned = ribbonToggleCollapsed(peeked)

  assert.deepEqual(pinned, { tab: 'view', collapsed: false, peek: false })
  assert.equal(ribbonPanelOpen(pinned), true)
})

test('固定展开时 dismiss 是空操作，且返回同一个对象（不制造多余重渲染）', () => {
  assert.equal(ribbonDismiss(start), start)
  assert.equal(ribbonSelect(start, 'home'), start)
})

test('Key Tip：大小写不敏感、多字符不认、没配字母的标签让路', () => {
  const items = [
    { id: 'home', keyTip: 'H' },
    { id: 'insert', keyTip: 'N' },
    { id: 'view', keyTip: 'W' },
    { id: 'review' },
  ]

  assert.equal(ribbonKeyTip(items, 'h'), 'home')
  assert.equal(ribbonKeyTip(items, 'N'), 'insert')
  assert.equal(ribbonKeyTip(items, 'w'), 'view')
  // 方向键、Tab、Escape 都不该被当成 Key Tip
  assert.equal(ribbonKeyTip(items, 'ArrowRight'), undefined)
  assert.equal(ribbonKeyTip(items, 'Escape'), undefined)
  assert.equal(ribbonKeyTip(items, ''), undefined)
  assert.equal(ribbonKeyTip(items, 'z'), undefined)
  assert.equal(ribbonKeyTip([{ id: 'a', keyTip: '' }], ''), undefined)
})

test('Key Tip 撞字母时先到先得：顺序即优先级', () => {
  const items = [
    { id: 'first', keyTip: 'F' },
    { id: 'second', keyTip: 'f' },
  ]
  assert.equal(ribbonKeyTip(items, 'f'), 'first')
})

test('一个 Key Tip 都没配时不该弹提示', () => {
  assert.equal(ribbonHasKeyTips([{ id: 'a' }, { id: 'b', keyTip: '' }]), false)
  assert.equal(ribbonHasKeyTips([{ id: 'a' }, { id: 'b', keyTip: 'B' }]), true)
})
