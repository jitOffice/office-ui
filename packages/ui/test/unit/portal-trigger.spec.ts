import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { OjPortal, OjTrigger } from '../../src/vue/index.ts'

/**
 * `OjPortal` / `OjTrigger` 的 DOM 行为（03 §3 D 组）。
 *
 * 纯时序部分在 `test/trigger.test.ts` 里用假时钟钉死了；这里只验**碰 DOM 的部分**：
 * teleport 到哪、滚动锁、焦点陷阱与归还、以及面板真的挂到了 body 上。
 */

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('OjPortal', () => {
  it('默认投到 body，且带上 z-index token', async () => {
    const outside = document.createElement('div')
    outside.id = 'outside'
    document.body.appendChild(outside)

    const wrapper = mount(OjPortal, {
      props: { zIndex: 'var(--oj-z-modal)' },
      slots: { default: () => h('p', { class: 'inside' }, '内容') },
      attachTo: outside,
    })
    await nextTick()

    // 不在宿主里，而在 body 直属
    expect(outside.querySelector('.inside')).toBeNull()
    const portalled = document.body.querySelector('.oj-portal')
    expect(portalled).not.toBeNull()
    expect(portalled?.parentElement).toBe(document.body)
    expect((portalled as HTMLElement).style.zIndex).toBe('var(--oj-z-modal)')

    wrapper.unmount()
  })

  it('to=false 时留在原地：宿主自己做了层级管理的情况', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const wrapper = mount(OjPortal, {
      props: { to: false },
      slots: { default: () => h('p', { class: 'inside' }, '内容') },
      attachTo: host,
    })
    await nextTick()

    expect(host.querySelector('.inside')).not.toBeNull()
    expect(document.body.querySelector(':scope > .oj-portal')).toBeNull()

    wrapper.unmount()
  })

  it('滚动锁：开时锁住 body，关时恢复原值（多个浮层同时开也不能互相踩）', async () => {
    document.body.style.overflow = 'auto'

    const first = mount(OjPortal, { props: { lockScroll: true }, slots: { default: () => h('i') } })
    expect(document.body.style.overflow).toBe('hidden')

    const second = mount(OjPortal, { props: { lockScroll: true }, slots: { default: () => h('i') } })
    first.unmount()
    // 还有一个开着，不能解
    expect(document.body.style.overflow).toBe('hidden')

    second.unmount()
    // 归零才恢复，而且是恢复成原来的值而不是空串
    expect(document.body.style.overflow).toBe('auto')
  })

  it('焦点陷阱：打开时焦点进第一个可聚焦元素，Tab 从末位回到首位，卸载后归还焦点', async () => {
    const opener = document.createElement('button')
    opener.id = 'opener'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const wrapper = mount(OjPortal, {
      props: { trapFocus: true },
      slots: {
        default: () => [h('button', { id: 'a' }, 'A'), h('button', { id: 'b' }, 'B')],
      },
      attachTo: document.body,
    })
    await nextTick()

    // 焦点不能留在背后的页面上
    expect((document.activeElement as HTMLElement).id).toBe('a')

    const b = document.getElementById('b') as HTMLButtonElement
    b.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    b.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(true)
    expect((document.activeElement as HTMLElement).id).toBe('a')

    wrapper.unmount()
    // 关闭归还焦点：掉了的话键盘用户就丢位置了
    expect(document.activeElement).toBe(opener)
  })
})

describe('OjTrigger', () => {
  it('点击打开面板，面板经 portal 挂到 body，Escape 关闭并同步 v-model', async () => {
    const wrapper = mount(OjTrigger, {
      props: { modes: ['click'], open: undefined as unknown as boolean },
      slots: {
        default: () => h('button', { id: 'trigger' }, '打开'),
        panel: () => h('div', { class: 'panel-body' }, '面板内容'),
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(document.body.querySelector('.oj-trigger__panel')).toBeNull()

    await wrapper.find('#trigger').trigger('click')
    await nextTick()

    const panel = document.body.querySelector('.oj-trigger__panel')
    expect(panel).not.toBeNull()
    expect(panel?.textContent).toContain('面板内容')
    // 面板不该留在触发器内部（否则会被祖先的 overflow:hidden 裁掉）
    expect(wrapper.find('.oj-trigger__panel').exists()).toBe(false)

    await wrapper.find('#trigger').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(document.body.querySelector('.oj-trigger__panel')).toBeNull()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')?.at(-1)).toEqual(['escape'])

    wrapper.unmount()
  })

  it('受控模式：只有 open 变化才决定面板在不在', async () => {
    const wrapper = mount(OjTrigger, {
      props: { open: false },
      slots: { default: () => h('button', { id: 'trigger' }, '打开'), panel: () => h('span', '内容') },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.find('#trigger').trigger('click')
    await nextTick()
    // 受控时点击只发事件，不自己改状态
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('.oj-trigger__panel')).toBeNull()

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.body.querySelector('.oj-trigger__panel')).not.toBeNull()

    wrapper.unmount()
  })

  it('portal=false 时面板留在触发器内部', async () => {
    const wrapper = mount(OjTrigger, {
      props: { modes: ['click'], portal: false, open: undefined as unknown as boolean },
      slots: { default: () => h('button', { id: 'trigger' }, '打开'), panel: () => h('span', '内容') },
    })
    await nextTick()

    await wrapper.find('#trigger').trigger('click')
    await nextTick()

    expect(wrapper.find('.oj-trigger__panel').exists()).toBe(true)

    wrapper.unmount()
  })
})
