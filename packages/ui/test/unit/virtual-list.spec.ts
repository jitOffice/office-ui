import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import { OjVirtualList } from '../../src/vue/index.ts'
import type { OjVirtualRow } from '../../src/vue/index.ts'

/**
 * `OjVirtualList` 的组件契约。
 *
 * 前缀和、窗口、锚点算法在 `test/virtual-list.test.ts` 用 `node --test` 覆盖；这里只验接线：
 * 滚动真的换窗口、测量真的改总高、上方插入真的还原滚动位置、`scrollToIndex` 真的落到位。
 */

const rows = (count: number, size = 50): { id: string; size: number }[] =>
  Array.from({ length: count }, (_, index) => ({ id: `r${index}`, size }))

function mountList(items = rows(5), overrides: Record<string, unknown> = {}) {
  return mount(OjVirtualList, {
    props: { items, estimateSize: 50, viewportSize: 100, overscan: 0, label: '批注列表', ...overrides },
    slots: {
      default: (row: OjVirtualRow) =>
        h('div', { class: 'row', 'data-id': row.item.id, 'data-index': row.index }, `第 ${row.index} 行`),
    },
  })
}

describe('OjVirtualList', () => {
  it('只渲染可视窗口，总高由 spacer 撑住', () => {
    const wrapper = mountList()
    const list = wrapper.find('.oj-virtual-list')
    expect(list.attributes('role')).toBe('list')
    expect(list.attributes('aria-label')).toBe('批注列表')

    const ids = wrapper.findAll('.row').map((row) => row.attributes('data-id'))
    // 视口 100 / 行高 50：0 与 1 完整可见，2 露出顶部
    expect(ids).toEqual(['r0', 'r1', 'r2'])
    expect(wrapper.find('.oj-virtual-list__spacer').attributes('style')).toContain('height: 250px')
    expect(wrapper.find('.oj-virtual-list__window').attributes('style')).toContain('translateY(0px)')
    wrapper.unmount()
  })

  it('滚动换窗口：窗口整体平移，不在原位置留白', async () => {
    const wrapper = mountList()
    const list = wrapper.find('.oj-virtual-list')
    ;(list.element as HTMLElement).scrollTop = 100
    await list.trigger('scroll')

    const ids = wrapper.findAll('.row').map((row) => row.attributes('data-id'))
    expect(ids).toEqual(['r2', 'r3', 'r4'])
    // 前两行被折叠掉的高度靠 translateY 还原，否则内容会从视口顶部开始画
    expect(wrapper.find('.oj-virtual-list__window').attributes('style')).toContain('translateY(100px)')
    wrapper.unmount()
  })

  it('量到真实高度后总高随之变化；同值不触发重渲染', async () => {
    let captured: OjVirtualRow | undefined
    let renders = 0
    const wrapper = mount(OjVirtualList, {
      props: { items: rows(3), estimateSize: 50, viewportSize: 100, label: '列表' },
      slots: {
        default: (row: OjVirtualRow) => {
          renders += 1
          if (row.index === 0) captured = row
          return h('div', { class: 'row', 'data-id': row.item.id })
        },
      },
    })
    expect(wrapper.find('.oj-virtual-list__spacer').attributes('style')).toContain('height: 150px')

    captured?.measure(80)
    await nextTick()
    expect(wrapper.find('.oj-virtual-list__spacer').attributes('style')).toContain('height: 180px')

    // ResizeObserver 会在同一帧反复回调：同值不能继续引发渲染
    const before = renders
    captured?.measure(80)
    await nextTick()
    expect(renders).toBe(before)
    wrapper.unmount()
  })

  it('上方插入内容不跳动：滚动位置跟着锚点行一起下移', async () => {
    const wrapper = mountList()
    const list = wrapper.find('.oj-virtual-list')
    ;(list.element as HTMLElement).scrollTop = 100
    await list.trigger('scroll')
    expect(wrapper.findAll('.row').map((row) => row.attributes('data-id'))).toEqual(['r2', 'r3', 'r4'])

    await wrapper.setProps({ items: [{ id: 'new', size: 50 }, ...rows(5)] })
    await nextTick()
    await nextTick()

    // 顶部多了一行 50px：滚动位置同步 +50，用户眼前那行仍是 r2
    expect((list.element as HTMLElement).scrollTop).toBe(150)
    expect(wrapper.findAll('.row').map((row) => row.attributes('data-id'))).toEqual(['r2', 'r3', 'r4'])
    wrapper.unmount()
  })

  it('scrollToIndex 夹住越界下标，并支持 start / center / end 对齐', async () => {
    const wrapper = mountList()
    const list = wrapper.find('.oj-virtual-list')
    const api = wrapper.vm as unknown as {
      scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void
    }

    api.scrollToIndex(3)
    await nextTick()
    await nextTick()
    expect((list.element as HTMLElement).scrollTop).toBe(150)

    // 越界不抛错：宿主传的是数据下标，删完条目后很容易越界
    api.scrollToIndex(99)
    await nextTick()
    await nextTick()
    expect((list.element as HTMLElement).scrollTop).toBe(150)

    api.scrollToIndex(1, 'center')
    await nextTick()
    await nextTick()
    expect((list.element as HTMLElement).scrollTop).toBe(25)
    wrapper.unmount()
  })

  it('空列表：不渲染行，spacer 高度为 0', () => {
    const wrapper = mountList([])
    expect(wrapper.findAll('.row')).toHaveLength(0)
    expect(wrapper.find('.oj-virtual-list__spacer').attributes('style')).toContain('height: 0px')
    wrapper.unmount()
  })
})
