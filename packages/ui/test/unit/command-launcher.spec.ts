import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'

import { OjCommandLauncher, OjRibbonGroup } from '../../src/vue/index.ts'
import type { RibbonPackItem } from '../../src/index.ts'

/**
 * `OjCommandLauncher`（03 §3 B 组）：组右下角那个打开对话框的小箭头。
 *
 * 要点不在"能不能点"，而在**它是纯图形按钮**：可访问名只能由使用方提供，
 * 语义必须是 `aria-haspopup="dialog"`（打开一块面板）而不是 `aria-expanded`（就地展开）。
 */

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OjCommandLauncher', () => {
  it('渲染成语义正确的按钮：可访问名、dialog 语义、箭头对读屏隐藏', () => {
    const wrapper = mount(OjCommandLauncher, { props: { label: '段落设置' } })

    const button = wrapper.get('button')
    expect(button.classes()).toContain('oj-command-launcher')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('段落设置')
    expect(button.attributes('aria-haspopup')).toBe('dialog')
    expect(button.attributes('title')).toBe('段落设置')
    // 箭头是纯装饰，不能进无障碍树——否则读屏会把它当内容念
    expect(wrapper.get('.oj-command-launcher__glyph').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })

  it('点击发 click 事件', async () => {
    const wrapper = mount(OjCommandLauncher, { props: { label: '段落设置' } })

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)

    wrapper.unmount()
  })

  it('禁用时点不动，但可访问名与 dialog 语义都还在', async () => {
    const wrapper = mount(OjCommandLauncher, { props: { label: '段落设置', disabled: true } })

    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-label')).toBe('段落设置')
    expect(button.attributes('aria-haspopup')).toBe('dialog')

    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('OjRibbonGroup 的 launcher 插槽', () => {
  const items: RibbonPackItem[] = [{ id: 'bold', size: 'small', width: 40 }]

  it('给了插槽就渲染在组的右下角包裹层里，没给就完全不渲染', () => {
    const withSlot = mount(OjRibbonGroup, {
      props: { items, available: 400 },
      slots: {
        item: ({ item }: { item: { id: string } }) => h('button', { class: 'cmd' }, item.id),
        launcher: () => h(OjCommandLauncher, { label: '段落设置' }),
      },
    })

    const box = withSlot.get('.oj-ribbon-group__launcher')
    expect(box.find('.oj-command-launcher').exists()).toBe(true)
    // 必须是最后一个孩子：它贴在右下角，DOM 顺序错了会成为 flex 布局里的一员，把命令挤走
    const group = withSlot.get('.oj-ribbon-group')
    expect(group.element.lastElementChild).toBe(box.element)

    withSlot.unmount()

    const withoutSlot = mount(OjRibbonGroup, {
      props: { items, available: 400 },
      slots: { item: ({ item }: { item: { id: string } }) => h('button', { class: 'cmd' }, item.id) },
    })
    expect(withoutSlot.find('.oj-ribbon-group__launcher').exists()).toBe(false)

    withoutSlot.unmount()
  })
})
