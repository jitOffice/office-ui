import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import { createDockState, undock } from '../../src/index.ts'
import { OjDockPanel } from '../../src/vue/index.ts'

/**
 * `OjDockPanel` 的组件契约。
 *
 * 状态机（停靠/浮动/收起/夹取）在 `test/dock.test.ts` 用 `node --test` 覆盖；这里只验接线：
 * 按钮发出的是"切到哪一态"、收起后标题栏还在、只有浮动态能拖标题栏。
 */

if (typeof Element.prototype.setPointerCapture !== 'function') {
  Object.defineProperty(Element.prototype, 'setPointerCapture', { value: () => undefined, configurable: true })
}

function pointer(element: Element, type: string, x: number, y: number): void {
  const event = new Event(type)
  Object.assign(event, { clientX: x, clientY: y, pointerId: 1, button: 0 })
  element.dispatchEvent(event)
}

const LABELS = {
  title: '属性',
  collapseLabel: '收起',
  expandLabel: '展开',
  floatLabel: '浮动',
  dockLabel: '停靠',
}

function mountPanel(state = createDockState(), overrides: Record<string, unknown> = {}) {
  return mount(OjDockPanel, {
    props: { state, ...LABELS, ...overrides },
    slots: { default: () => h('p', { class: 'slot-body' }, '面板内容') },
  })
}

describe('OjDockPanel', () => {
  it('停靠渲染：标题、方向与两个按钮的可访问名', () => {
    const wrapper = mountPanel()
    const panel = wrapper.find('.oj-dock')
    expect(panel.attributes('aria-label')).toBe('属性')
    expect(panel.attributes('data-side')).toBe('right')
    expect(wrapper.find('.oj-dock__title').text()).toBe('属性')
    expect(wrapper.find('.slot-body').exists()).toBe(true)

    const collapse = wrapper.find('.oj-dock__collapse')
    expect(collapse.attributes('aria-expanded')).toBe('true')
    expect(collapse.attributes('aria-label')).toBe('收起')
    const float = wrapper.find('.oj-dock__float')
    expect(float.attributes('aria-pressed')).toBe('false')
    expect(float.attributes('aria-label')).toBe('浮动')
    wrapper.unmount()
  })

  it('收起：只发状态，标题栏与展开入口必须还在', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.oj-dock__collapse').trigger('click')
    expect((wrapper.emitted('update:state')?.[0]?.[0] as { collapsed: boolean }).collapsed).toBe(true)

    // 受控：组件自己不改 props，所以内容还在
    expect(wrapper.find('.slot-body').exists()).toBe(true)
    wrapper.unmount()

    const collapsed = mountPanel(createDockState({ collapsed: true }))
    expect(collapsed.find('.oj-dock').attributes('data-collapsed')).toBe('')
    expect(collapsed.find('.slot-body').exists()).toBe(false)
    expect(collapsed.find('.oj-dock__header').exists()).toBe(true)
    const button = collapsed.find('.oj-dock__collapse')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-label')).toBe('展开')
    collapsed.unmount()
  })

  it('浮动：位置与尺寸写成内联样式；再次点击回到上次停靠侧', async () => {
    const floating = mountPanel(undock(createDockState({ float: { x: 120, y: 80, width: 360, height: 420 } })))
    const panel = floating.find('.oj-dock')
    expect(panel.attributes('data-side')).toBe('floating')
    expect(panel.attributes('style')).toContain('left: 120px')
    expect(panel.attributes('style')).toContain('top: 80px')
    expect(panel.attributes('style')).toContain('width: 360px')
    expect(panel.attributes('style')).toContain('height: 420px')

    const button = floating.find('.oj-dock__float')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('aria-label')).toBe('停靠')
    await button.trigger('click')
    expect((floating.emitted('update:state')?.[0]?.[0] as { side: string }).side).toBe('right')
    floating.unmount()

    // 收起后浮动面板不写死高度，否则只剩标题栏却留着一大块空白
    const collapsed = mountPanel(undock(createDockState({ collapsed: true, float: { x: 10, y: 10 } })))
    expect(collapsed.find('.oj-dock').attributes('style')).not.toContain('height:')
    collapsed.unmount()
  })

  it('拖标题栏移动浮窗；拖出屏幕时当场夹住而不是松手才跳回来', async () => {
    const wrapper = mountPanel(undock(createDockState({ float: { x: 100, y: 80, width: 320, height: 480 } })))
    const header = wrapper.find('.oj-dock__header').element

    pointer(header, 'pointerdown', 200, 100)
    pointer(header, 'pointermove', 260, 140)
    await wrapper.vm.$nextTick()

    const moved = wrapper.emitted('update:state')?.[0]?.[0] as {
      float: { x: number; y: number; width: number; height: number }
    }
    expect(moved.float).toEqual({ x: 160, y: 120, width: 320, height: 480 })

    // 松开后不能再跟着鼠标跑（happy-dom 没实现指针捕获，这里验的是状态复位）
    pointer(header, 'pointerup', 260, 140)
    pointer(header, 'pointermove', 300, 200)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:state')).toHaveLength(1)

    pointer(header, 'pointerdown', 200, 100)
    pointer(header, 'pointermove', -9999, -9999)
    await wrapper.vm.$nextTick()
    const clamped = wrapper.emitted('update:state')?.[1]?.[0] as { float: { x: number; y: number } }
    // 左边缘最多移出到只剩一条标题栏，上边缘不许出界
    expect(clamped.float.x).toBe(48 - 320)
    expect(clamped.float.y).toBe(0)
    wrapper.unmount()
  })

  it('停靠态拖标题栏无效；点按钮也不会顺带拖动面板', async () => {
    const docked = mountPanel()
    const header = docked.find('.oj-dock__header').element
    pointer(header, 'pointerdown', 100, 100)
    pointer(header, 'pointermove', 200, 200)
    await docked.vm.$nextTick()
    expect(docked.emitted('update:state')).toBeUndefined()
    docked.unmount()

    const floating = mountPanel(undock(createDockState()))
    const button = floating.find('.oj-dock__collapse').element
    pointer(button, 'pointerdown', 100, 100)
    pointer(floating.find('.oj-dock__header').element, 'pointermove', 200, 200)
    await floating.vm.$nextTick()
    expect(floating.emitted('update:state')).toBeUndefined()
    floating.unmount()
  })
})
