import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { OjFileTree, OjSignaturePad, OjTableGridPicker } from '../../src/vue/index.ts'
import type { FileNode } from '../../src/shell/files.ts'

/**
 * 树、表格框选、签名板（03 §3/§4）。
 *
 * 三个组件都**不持有选择状态**：`openIds` / `selectedId` 由使用方给，
 * 组件只发 `toggle` / `select` / `change`。所以断言盯事件与派生渲染（深度缩进、
 * 越界提示），而不是"点完之后组件自己变了没有"。
 */

describe('OjFileTree', () => {
  const nodes: readonly FileNode[] = [
    {
      id: 'docs',
      name: '文档',
      kind: 'folder',
      children: [
        { id: 'a', name: 'a.md', kind: 'file' },
        { id: 'b', name: 'b.md', kind: 'file' },
      ],
    },
    { id: 'readme', name: 'README.md', kind: 'file' },
  ]

  it('空树渲染一句说明，而不是一个空框', () => {
    const wrapper = mount(OjFileTree, { props: { nodes: [], emptyLabel: '没有文件' } })
    expect(wrapper.find('.oj-files__empty').text()).toBe('没有文件')
    expect(wrapper.find('[role="tree"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('文件夹未展开时不渲染子节点，展开后子节点缩进一级', async () => {
    const wrapper = mount(OjFileTree, { props: { nodes } })

    expect(wrapper.attributes('role')).toBe('tree')
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(wrapper.find('[role="treeitem"]').attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({ openIds: ['docs'] })

    const items = wrapper.findAll('[role="treeitem"]')
    expect(items).toHaveLength(4)
    expect(items[0]!.attributes('aria-expanded')).toBe('true')
    const group = wrapper.find('[role="group"]')
    expect(group.exists()).toBe(true)
    // 深度 1：8 + 1 × 16
    expect(group.find('[role="treeitem"]').attributes('style')).toContain('padding-left: 24px')

    wrapper.unmount()
  })

  it('点文件夹既 toggle 又 select；点文件只有 select', async () => {
    const wrapper = mount(OjFileTree, { props: { nodes, openIds: ['docs'] } })
    const items = wrapper.findAll('[role="treeitem"]')

    await items[0]!.trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['docs']])
    expect(wrapper.emitted('select')).toEqual([['docs']])

    // group 里的第一个子项
    await wrapper.find('[role="group"] [role="treeitem"]').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.emitted('select')).toEqual([['docs'], ['a']])

    wrapper.unmount()
  })

  it('selectedId 落在 aria-selected 上', () => {
    const wrapper = mount(OjFileTree, { props: { nodes, selectedId: 'readme' } })
    const items = wrapper.findAll('[role="treeitem"]')
    expect(items.map((item) => item.attributes('aria-selected'))).toEqual(['false', 'true'])
    wrapper.unmount()
  })
})

describe('OjTableGridPicker', () => {
  const small = { rows: 3, cols: 4 }

  it('网格规模来自 props，并回报给无障碍树', () => {
    const wrapper = mount(OjTableGridPicker, { props: small })

    expect(wrapper.find('[role="grid"]').attributes('aria-rowcount')).toBe('3')
    expect(wrapper.find('[role="grid"]').attributes('aria-colcount')).toBe('4')
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(12)

    // 还没悬停：overlay 标空，尺寸文案不渲染
    expect(wrapper.find('.oj-grid-picker__overlay').attributes('data-empty')).toBe('')
    expect(wrapper.find('.oj-grid-picker__size').exists()).toBe(false)

    wrapper.unmount()
  })

  it('悬停出尺寸，点击发 select', async () => {
    const wrapper = mount(OjTableGridPicker, { props: small })
    const cells = wrapper.findAll('[role="gridcell"]')

    // 第 2 行第 3 列 → 行优先索引 (2-1)*4 + (3-1) = 6
    await cells[6]!.trigger('mouseenter')
    expect(wrapper.find('.oj-grid-picker__size').text()).toBe('2 × 3')
    expect(wrapper.find('.oj-grid-picker__overlay').attributes('data-empty')).toBeUndefined()
    expect(cells[6]!.attributes('aria-selected')).toBe('true')

    await cells[6]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[{ row: 2, col: 3 }]])

    wrapper.unmount()
  })

  it('format 可以换掉尺寸文案（本地化由使用方决定）', async () => {
    const wrapper = mount(OjTableGridPicker, {
      props: { ...small, format: (cell: { row: number; col: number }) => `${cell.row} 行 ${cell.col} 列` },
    })
    await wrapper.findAll('[role="gridcell"]')[0]!.trigger('mouseenter')
    expect(wrapper.find('.oj-grid-picker__size').text()).toBe('1 行 1 列')
    wrapper.unmount()
  })

  it('键盘：首次方向键落在 (1,1)，Enter 提交，Escape 交给外层', async () => {
    const wrapper = mount(OjTableGridPicker, { props: small })
    const grid = wrapper.find('[role="grid"]')

    await grid.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.oj-grid-picker__size').text()).toBe('1 × 1')

    await grid.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('select')).toBeUndefined()

    await grid.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([[{ row: 1, col: 1 }]])

    wrapper.unmount()
  })

  it('越过上限时给提示，但保留当前悬停格', async () => {
    const wrapper = mount(OjTableGridPicker, { props: { rows: 1, cols: 1, exceedLabel: '更大的表请用对话框' } })
    const grid = wrapper.find('[role="grid"]')

    // 第一次方向键先落到 (1,1)，第二次才越界
    await grid.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.oj-grid-picker__exceed').exists()).toBe(false)
    await grid.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.oj-grid-picker__exceed').text()).toBe('更大的表请用对话框')
    // 悬停格没被清掉：用户还能回车提交 1×1
    expect(wrapper.find('.oj-grid-picker__size').text()).toBe('1 × 1')

    wrapper.unmount()
  })

  it('detail 按钮发 detail', async () => {
    const wrapper = mount(OjTableGridPicker, { props: { ...small, detailLabel: '插入表格…' } })
    await wrapper.find('.oj-grid-picker__detail').trigger('click')
    expect(wrapper.emitted('detail')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('OjSignaturePad', () => {
  // happy-dom 没有实现指针捕获；缺了它组件会在 pointerdown 里抛错，
  // 所以这里补一个 no-op——测的是笔迹模型，不是指针捕获本身。
  if (typeof Element.prototype.setPointerCapture !== 'function') {
    Object.defineProperty(Element.prototype, 'setPointerCapture', { value: () => undefined, configurable: true })
  }

  function pointer(element: Element, type: string, x: number, y: number): void {
    const event = new Event(type)
    Object.assign(event, { clientX: x, clientY: y, pointerId: 1 })
    element.dispatchEvent(event)
  }

  it('按下到抬起之间才画：抬笔后的移动不算笔迹', async () => {
    const wrapper = mount(OjSignaturePad, { props: { clearLabel: '清除' }, attachTo: document.body })
    const svg = wrapper.find('svg').element

    // 抬笔状态下的移动必须被忽略，否则鼠标划过签名区就会留一道
    pointer(svg, 'pointermove', 30, 30)
    expect(wrapper.emitted('change')).toBeUndefined()

    pointer(svg, 'pointerdown', 10, 10)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.findAll('path')).toHaveLength(1)

    pointer(svg, 'pointermove', 20, 24)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toHaveLength(2)
    expect(wrapper.findAll('path')).toHaveLength(1)

    pointer(svg, 'pointerup', 20, 24)
    await wrapper.vm.$nextTick()
    pointer(svg, 'pointermove', 60, 60)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toHaveLength(2)

    wrapper.unmount()
  })

  it('清除发一个空笔迹数组', async () => {
    const wrapper = mount(OjSignaturePad, { props: { clearLabel: '清除' } })
    const svg = wrapper.find('svg').element
    pointer(svg, 'pointerdown', 1, 1)
    await wrapper.vm.$nextTick()

    await wrapper.find('button').trigger('click')
    const changes = wrapper.emitted('change') as unknown[][]
    expect(changes).toHaveLength(2)
    expect(changes[1]).toEqual([[]])
    expect(wrapper.findAll('path')).toHaveLength(0)

    wrapper.unmount()
  })
})
