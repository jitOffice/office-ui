import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { OjDropdownButton, OjSplitButton, OjToggleButton } from '../../src/vue/index.ts'

/**
 * `OjToggleButton` / `OjSplitButton`（03 §3 B 组）。
 *
 * 开关按钮验的是状态归谁；拆分按钮验的是**两个可点区域真的分开**——
 * 合成一个再判断点击坐标，是这类控件最常见的实现方式，也是最容易在触屏上出错的一种。
 */

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OjToggleButton', () => {
  it('按下态走 aria-pressed，点击只发变更、不自己改状态', async () => {
    const wrapper = mount(OjToggleButton, {
      props: { modelValue: false, label: '修订模式' },
      attachTo: document.body,
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('data-active')).toBeUndefined()

    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    // 受控：父级没改 prop，界面就不该自己亮
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('button').attributes('data-active')).toBe('')

    wrapper.unmount()
  })

  it('disabled 时不发事件', async () => {
    const wrapper = mount(OjToggleButton, {
      props: { modelValue: false, label: '格式刷', disabled: true },
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('OjSplitButton', () => {
  function mountSplit(props: Record<string, unknown> = {}) {
    return mount(OjSplitButton, {
      props: { label: '粘贴', menuLabel: '粘贴选项', ...props },
      slots: {
        default: () => [
          h('button', { type: 'button', 'data-value': 'plain' }, '只保留文本'),
          h('button', { type: 'button', 'data-value': 'image' }, '粘贴为图片'),
        ],
      },
      attachTo: document.body,
    })
  }

  it('主区点击只执行主操作，不打开菜单', async () => {
    const wrapper = mountSplit()

    await wrapper.find('.oj-split__main').trigger('click')
    await nextTick()

    expect(wrapper.emitted('run')).toHaveLength(1)
    expect(wrapper.find('.oj-split__menu').exists()).toBe(false)
    expect(wrapper.find('.oj-split__arrow').attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('箭头只负责开菜单，条目带 data-value 就发 select 并关闭', async () => {
    const wrapper = mountSplit()

    await wrapper.find('.oj-split__arrow').trigger('click')
    await nextTick()

    expect(wrapper.emitted('run')).toBeUndefined()
    expect(wrapper.find('.oj-split__arrow').attributes('aria-expanded')).toBe('true')
    const menu = wrapper.find('.oj-split__menu')
    expect(menu.exists()).toBe(true)
    expect(menu.findAll('[data-value]').map((node) => node.attributes('data-value'))).toEqual(['plain', 'image'])

    await wrapper.findAll('[data-value]')[1]!.trigger('click')
    await nextTick()

    expect(wrapper.emitted('select')?.at(-1)).toEqual(['image'])
    expect(wrapper.find('.oj-split__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('Escape 关闭菜单并把焦点还给箭头', async () => {
    const wrapper = mountSplit()
    await wrapper.find('.oj-split__arrow').trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('.oj-split__menu').exists()).toBe(false)
    expect((document.activeElement as HTMLElement).className).toContain('oj-split__arrow')

    wrapper.unmount()
  })

  it('点外面关菜单；受控 open 不被组件擅自改动', async () => {
    const wrapper = mountSplit({ open: false })
    await wrapper.find('.oj-split__arrow').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    // 受控：父级没接受，菜单不能自己冒出来
    expect(wrapper.find('.oj-split__menu').exists()).toBe(false)

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(wrapper.find('.oj-split__menu').exists()).toBe(true)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('disabled 时两个区域都不响应', async () => {
    const wrapper = mountSplit({ disabled: true })

    await wrapper.find('.oj-split__main').trigger('click')
    await wrapper.find('.oj-split__arrow').trigger('click')

    expect(wrapper.emitted('run')).toBeUndefined()
    expect(wrapper.emitted('update:open')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('OjDropdownButton', () => {
  function mountDropdown(props: Record<string, unknown> = {}) {
    return mount(OjDropdownButton, {
      props: { label: '边框', ...props },
      slots: {
        default: () => [
          h('button', { type: 'button', 'data-value': 'all' }, '所有框线'),
          h('button', { type: 'button', 'data-value': 'none' }, '无框线'),
        ],
      },
      attachTo: document.body,
    })
  }

  it('整颗按钮都是触发器：点击开合菜单，aria-expanded 跟着变', async () => {
    const wrapper = mountDropdown()

    const trigger = wrapper.find('.oj-dropdown-button__trigger')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')
    await nextTick()
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(true)
    expect(wrapper.find('.oj-dropdown-button__trigger').attributes('aria-expanded')).toBe('true')

    await wrapper.find('.oj-dropdown-button__trigger').trigger('click')
    await nextTick()
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('↓ 也能打开；菜单条目带 data-value 就发 select 并关闭', async () => {
    const wrapper = mountDropdown()

    await wrapper.find('.oj-dropdown-button__trigger').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(true)

    await wrapper.findAll('[data-value]')[1]!.trigger('click')
    await nextTick()
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['none'])
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('Esc 关闭并把焦点还给触发器；点外面也关闭', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('.oj-dropdown-button__trigger').trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(false)
    expect((document.activeElement as HTMLElement).className).toContain('oj-dropdown-button__trigger')

    await wrapper.find('.oj-dropdown-button__trigger').trigger('click')
    await nextTick()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.oj-dropdown-button__menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('受控 open 不被擅自改动；disabled 时不响应', async () => {
    const controlled = mountDropdown({ open: false })
    await controlled.find('.oj-dropdown-button__trigger').trigger('click')
    await nextTick()

    expect(controlled.emitted('update:open')?.at(-1)).toEqual([true])
    expect(controlled.find('.oj-dropdown-button__menu').exists()).toBe(false)
    controlled.unmount()

    const disabled = mountDropdown({ disabled: true })
    await disabled.find('.oj-dropdown-button__trigger').trigger('click')
    expect(disabled.emitted('update:open')).toBeUndefined()
    disabled.unmount()
  })
})
