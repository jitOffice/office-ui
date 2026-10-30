import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'

import { OjToolbar } from '../../src/vue/index.ts'
import type { RibbonPackItem } from '../../src/index.ts'

/**
 * `OjToolbar`（03 §3 B 组）：三种溢出策略。
 *
 * 这里只验"策略真的换了结构"：`menu` 必须落到 `OjRibbonGroup`（同一套宽度预算），
 * `scroll` / `wrap` 则必须把所有命令都渲染出来——用 `»` 去实现 scroll 是最容易犯的错，
 * 因为那等于换了一种交互却没说。
 */

const items: RibbonPackItem[] = [
  { id: 'bold', size: 'small', width: 100 },
  { id: 'italic', size: 'small', width: 100 },
  { id: 'underline', size: 'small', width: 100 },
]

function mountToolbar(props: Record<string, unknown> = {}) {
  return mount(OjToolbar, {
    props: { items, label: '格式', ...props },
    slots: { item: ({ item }: { item: { id: string } }) => h('button', { class: 'cmd' }, item.id) },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OjToolbar', () => {
  it('默认 menu：宽度不够就收进 `»`，宽度够就全显示', async () => {
    const narrow = mountToolbar({ available: 90 })
    expect(narrow.find('.oj-ribbon-group').exists()).toBe(true)
    expect(narrow.find('.oj-ribbon-group__overflow').exists()).toBe(true)
    expect(narrow.findAll('.oj-ribbon-group__item').length).toBe(0)
    narrow.unmount()

    const wide = mountToolbar({ available: 400 })
    expect(wide.findAll('.oj-ribbon-group__item').length).toBe(3)
    expect(wide.find('.oj-ribbon-group__overflow').exists()).toBe(false)
    wide.unmount()
  })

  it('scroll：全部渲染，靠横向滚动，不出现 `»`', async () => {
    const wrapper = mountToolbar({ overflow: 'scroll', available: 90 })

    const root = wrapper.find('.oj-toolbar')
    expect(root.attributes('data-overflow')).toBe('scroll')
    expect(root.attributes('role')).toBe('toolbar')
    expect(wrapper.findAll('.oj-toolbar__item').map((node) => node.attributes('data-item'))).toEqual([
      'bold',
      'italic',
      'underline',
    ])
    expect(wrapper.find('.oj-ribbon-group').exists()).toBe(false)
    expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

    wrapper.unmount()
  })

  it('wrap：全部渲染并折行，同样不走溢出菜单', async () => {
    const wrapper = mountToolbar({ overflow: 'wrap', available: 90 })

    expect(wrapper.find('.oj-toolbar').attributes('data-overflow')).toBe('wrap')
    expect(wrapper.findAll('.oj-toolbar__item')).toHaveLength(3)
    expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

    wrapper.unmount()
  })

  it('溢出菜单里的条目沿用同一个 item 插槽，顺序与工具条一致', async () => {
    const wrapper = mountToolbar({ available: 90 })

    await wrapper.find('.oj-ribbon-group__overflow').trigger('click')
    await wrapper.vm.$nextTick()

    expect(
      wrapper.findAll('.oj-ribbon-group__menu-item').map((node) => node.attributes('data-item')),
    ).toEqual(['bold', 'italic', 'underline'])

    wrapper.unmount()
  })
})
