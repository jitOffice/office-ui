import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { OjRibbonGroup } from '../../src/vue/index.ts'
import type { RibbonPackItem } from '../../src/index.ts'

/**
 * `OjRibbonGroup` 的 DOM 行为（03 §3 B 组）。
 *
 * 布局规则本身在 `test/ribbon.test.ts` 里用零依赖的 `node --test` 钉死了；这里只验
 * **接线**：宽度喂进去了没、`»` 里的顺序对不对、点一条之后菜单关不关。
 */

afterEach(() => {
  document.body.innerHTML = ''
})

const items: RibbonPackItem[] = [
  { id: 'paste', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  { id: 'copy', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
  { id: 'cut', size: 'large', width: 100, widths: { medium: 60, small: 40 } },
]

function mountGroup(available: number) {
  return mount(OjRibbonGroup, {
    props: { items, available },
    slots: {
      item: ({ item }: { item: { id: string; display: string } }) =>
        h('button', { class: 'cmd', 'data-display': item.display }, item.id),
    },
  })
}

describe('OjRibbonGroup', () => {
  it('按给定宽度铺开：装得下就三档原样显示，没有 `»`', () => {
    const wrapper = mountGroup(320)

    const rendered = wrapper.findAll('.oj-ribbon-group__item')
    expect(rendered.map((node) => node.attributes('data-item'))).toEqual(['paste', 'copy', 'cut'])
    expect(rendered.map((node) => node.attributes('data-size'))).toEqual(['large', 'large', 'large'])
    expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

    wrapper.unmount()
  })

  it('宽度不够先降级，槽里拿到的是降级后的尺寸', async () => {
    const wrapper = mountGroup(130)

    const rendered = wrapper.findAll('.oj-ribbon-group__item')
    expect(rendered.map((node) => node.attributes('data-size'))).toEqual(['small', 'small', 'small'])
    expect(wrapper.findAll('.cmd').map((node) => node.attributes('data-display'))).toEqual([
      'small',
      'small',
      'small',
    ])
    expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

    await wrapper.setProps({ available: 320 })
    expect(wrapper.find('.oj-ribbon-group__item').attributes('data-size')).toBe('large')

    wrapper.unmount()
  })

  it('还装不下就收进 `»`：菜单顺序与组内一致，点一条后关闭', async () => {
    const wrapper = mountGroup(90)

    expect(wrapper.findAll('.oj-ribbon-group__item').map((node) => node.attributes('data-item'))).toEqual(['paste'])
    const overflow = wrapper.find('.oj-ribbon-group__overflow')
    expect(overflow.exists()).toBe(true)
    expect(overflow.attributes('aria-expanded')).toBe('false')

    await overflow.trigger('click')
    await nextTick()

    expect(wrapper.find('.oj-ribbon-group__overflow').attributes('aria-expanded')).toBe('true')
    const menu = wrapper.find('.oj-ribbon-group__menu')
    expect(menu.exists()).toBe(true)
    expect(menu.findAll('.oj-ribbon-group__menu-item').map((node) => node.attributes('data-item'))).toEqual([
      'copy',
      'cut',
    ])

    await menu.findAll('.oj-ribbon-group__menu-item')[0]!.trigger('click')
    await nextTick()
    expect(wrapper.find('.oj-ribbon-group__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('变宽后 `»` 消失、菜单也跟着关：再变窄不会自己弹出来', async () => {
    const wrapper = mountGroup(90)

    await wrapper.find('.oj-ribbon-group__overflow').trigger('click')
    await nextTick()
    expect(wrapper.find('.oj-ribbon-group__menu').exists()).toBe(true)

    await wrapper.setProps({ available: 320 })
    expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

    await wrapper.setProps({ available: 90 })
    expect(wrapper.find('.oj-ribbon-group__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('不给 available 时用 ResizeObserver 量自己，量到多宽就按多宽排', async () => {
    let notify: ((entries: { contentRect: { width: number } }[]) => void) | undefined
    const connected: Element[] = []

    class FakeResizeObserver {
      constructor(callback: (entries: { contentRect: { width: number } }[]) => void) {
        notify = callback
      }
      observe(el: Element): void {
        connected.push(el)
      }
      disconnect(): void {
        connected.length = 0
      }
    }

    const original = globalThis.ResizeObserver
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver

    try {
      const wrapper = mount(OjRibbonGroup, {
        props: { items },
        slots: { item: ({ item }: { item: { id: string } }) => h('button', { class: 'cmd' }, item.id) },
      })
      await nextTick()

      // 还没量到宽度时宁可全进 `»`，也不要按 0 宽猜布局
      expect(wrapper.findAll('.oj-ribbon-group__item')).toHaveLength(0)
      expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(true)
      expect(connected).toHaveLength(1)

      notify?.([{ contentRect: { width: 320 } }])
      await nextTick()
      expect(wrapper.findAll('.oj-ribbon-group__item')).toHaveLength(3)
      expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(false)

      wrapper.unmount()
      expect(connected).toHaveLength(0)
    } finally {
      globalThis.ResizeObserver = original
    }
  })

  it('不给宽度时自己量：按 medium → small 逐档探测，再按真实宽度降级/溢出', async () => {
    // happy-dom 不做布局，把 offsetWidth 按 data-size 造出来，跑的是真实的状态机
    const WIDTHS: Record<string, number> = { large: 100, medium: 60, small: 40 }
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get(this: HTMLElement) {
        const size = this.dataset?.size
        return size === undefined ? 0 : (WIDTHS[size] ?? 0)
      },
    })

    try {
      const wrapper = mount(OjRibbonGroup, {
        props: {
          items: [
            { id: 'paste', size: 'large' },
            { id: 'copy', size: 'large' },
            { id: 'cut', size: 'large' },
          ],
          available: 90,
        },
        slots: { item: ({ item }: { item: { id: string } }) => h('button', { class: 'cmd' }, item.id) },
      })

      // 每次状态切换各占一次刷新：首帧量 large → 探 medium → 探 small → 定稿
      for (let i = 0; i < 12; i += 1) await nextTick()

      expect(wrapper.find('.oj-ribbon-group').attributes('data-probe')).toBeUndefined()
      // 40 × 3 + 2 × 2 > 90，只能留一项，`»` 里是 copy/cut
      expect(wrapper.findAll('.oj-ribbon-group__item').map((node) => node.attributes('data-item'))).toEqual(['paste'])
      expect(wrapper.findAll('.oj-ribbon-group__item')[0]!.attributes('data-size')).toBe('small')
      expect(wrapper.find('.oj-ribbon-group__overflow').exists()).toBe(true)

      await wrapper.find('.oj-ribbon-group__overflow').trigger('click')
      await nextTick()
      expect(
        wrapper.findAll('.oj-ribbon-group__menu-item').map((node) => node.attributes('data-item')),
      ).toEqual(['copy', 'cut'])

      wrapper.unmount()
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original)
    }
  })
})
