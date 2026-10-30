import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { OjRibbon } from '../../src/vue/index.ts'

/**
 * `OjRibbon` 的 DOM 行为（03 §3 B / §5 第 2、4 条）。
 *
 * 折叠规则本身在 `test/ribbon-chrome.test.ts` 里用零依赖的 `node --test` 钉死了；
 * 这里验的是**接线**：aria、方向键、双击、点外面收回、受控折叠不被组件擅自改掉。
 */

const items = [
  { id: 'home', label: '开始' },
  { id: 'insert', label: '插入' },
  { id: 'view', label: '视图' },
]

function mountRibbon(props: Record<string, unknown> = {}) {
  return mount(OjRibbon, {
    props: { items, modelValue: 'home', label: '功能区', ...props },
    slots: { default: ({ tab }: { tab: string }) => h('div', { class: 'panel-body' }, `面板:${tab}`) },
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OjRibbon', () => {
  it('tablist / tab / tabpanel 三件套齐全，默认展开', async () => {
    const wrapper = mountRibbon()
    await nextTick()

    const tabbar = wrapper.find('.oj-ribbon__tabbar')
    expect(tabbar.attributes('role')).toBe('tablist')
    expect(tabbar.attributes('aria-label')).toBe('功能区')

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.map((node) => node.text())).toEqual(['开始', '插入', '视图'])
    expect(tabs.map((node) => node.attributes('aria-selected'))).toEqual(['true', 'false', 'false'])
    // roving tabindex：只有当前标签可 Tab 进入
    expect(tabs.map((node) => node.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
    expect(tabs[0]!.attributes('aria-controls')).toBe('oj-ribbon-panel-home')

    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.attributes('id')).toBe('oj-ribbon-panel-home')
    expect(panel.attributes('aria-labelledby')).toBe('oj-ribbon-tab-home')
    expect(panel.attributes('hidden')).toBeUndefined()
    expect(wrapper.find('.panel-body').text()).toBe('面板:home')

    wrapper.unmount()
  })

  it('单击切标签：面板跟着换，并同步 v-model', async () => {
    const wrapper = mountRibbon()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['insert'])
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('插入')
    expect(wrapper.find('[role="tabpanel"]').attributes('id')).toBe('oj-ribbon-panel-insert')
    expect(wrapper.find('.panel-body').text()).toBe('面板:insert')

    wrapper.unmount()
  })

  it('双击标签收起：面板 hidden，aria-expanded 变 false，标签不丢', async () => {
    const wrapper = mountRibbon()
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    await wrapper.findAll('[role="tab"]')[2]!.trigger('dblclick')
    await nextTick()

    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([true])
    expect(wrapper.find('.oj-ribbon').attributes('data-collapsed')).toBe('')
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBe('')
    expect(wrapper.find('.oj-ribbon__collapse').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('视图')

    wrapper.unmount()
  })

  it('收起态单击标签只是临时展开，点面板外面就收回', async () => {
    const wrapper = mountRibbon()
    await wrapper.find('.oj-ribbon__collapse').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBe('')

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await nextTick()
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBeUndefined()
    expect(wrapper.find('.panel-body').text()).toBe('面板:insert')
    // 仍然是"收起"状态，只是临时看了一眼
    expect(wrapper.find('.oj-ribbon').attributes('data-collapsed')).toBe('')

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBe('')

    wrapper.unmount()
  })

  it('Esc 收回临时展开，并把焦点留在当前标签上', async () => {
    const wrapper = mountRibbon()
    await wrapper.find('.oj-ribbon__collapse').trigger('click')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()

    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBe('')
    expect((document.activeElement as HTMLElement).dataset.tab).toBe('home')

    wrapper.unmount()
  })

  it('方向键在标签间循环，Home / End 跳两端，焦点跟着走', async () => {
    const wrapper = mountRibbon()
    await nextTick()

    const first = wrapper.findAll('[role="tab"]')[0]!
    await first.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('插入')
    expect((document.activeElement as HTMLElement).dataset.tab).toBe('insert')

    await wrapper.findAll('[role="tab"]')[1]!.trigger('keydown', { key: 'End' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('视图')

    await wrapper.findAll('[role="tab"]')[2]!.trigger('keydown', { key: 'Home' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('开始')

    wrapper.unmount()
  })

  it('受控折叠：prop 没接受变更时，组件不擅自展开/收起', async () => {
    const wrapper = mountRibbon({ collapsed: false })
    await wrapper.find('.oj-ribbon__collapse').trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([true])
    // 父级没改 prop，所以面板必须还开着
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBeUndefined()

    await wrapper.setProps({ collapsed: true })
    await nextTick()
    expect(wrapper.find('[role="tabpanel"]').attributes('hidden')).toBe('')

    wrapper.unmount()
  })

  it('Alt keyup 浮出 Key Tips，按字母直达标签', async () => {
    const keyed = [
      { id: 'home', label: '开始', keyTip: 'H' },
      { id: 'insert', label: '插入', keyTip: 'N' },
      { id: 'view', label: '视图', keyTip: 'W' },
    ]
    const wrapper = mountRibbon({ items: keyed })

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    await nextTick()

    expect(wrapper.find('.oj-ribbon').attributes('data-keytips')).toBe('')
    expect(wrapper.findAll('.oj-ribbon__keytip').map((node) => node.text())).toEqual(['H', 'N', 'W'])
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-keyshortcuts')).toBe('Alt+N')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['insert'])
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('插入')
    expect(wrapper.find('.oj-ribbon').attributes('data-keytips')).toBeUndefined()
    expect((document.activeElement as HTMLElement).dataset.tab).toBe('insert')

    wrapper.unmount()
  })

  it('Key Tips 展开时 Escape 只收起提示，不动标签', async () => {
    const keyed = [{ id: 'home', label: '开始', keyTip: 'H' }, { id: 'insert', label: '插入', keyTip: 'N' }]
    const wrapper = mountRibbon({ items: keyed })

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    await nextTick()
    expect(wrapper.find('.oj-ribbon__keytip').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('.oj-ribbon__keytip').exists()).toBe(false)
    expect(wrapper.find('[role="tab"][aria-selected="true"]').text()).toBe('开始')

    wrapper.unmount()
  })

  it('带修饰键的字母不算 Key Tip（macOS 上 Alt+字母是特殊字符）', async () => {
    const keyed = [{ id: 'home', label: '开始', keyTip: 'H' }, { id: 'insert', label: '插入', keyTip: 'N' }]
    const wrapper = mountRibbon({ items: keyed })

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', altKey: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.oj-ribbon__keytip').exists()).toBe(false)

    wrapper.unmount()
  })

  it('一个 Key Tip 都没配时按 Alt 不弹提示', async () => {
    const wrapper = mountRibbon()

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    await nextTick()

    expect(wrapper.find('.oj-ribbon').attributes('data-keytips')).toBeUndefined()
    expect(wrapper.find('.oj-ribbon__keytip').exists()).toBe(false)

    wrapper.unmount()
  })

  it('收起时用当前标签的面板 id 关联 tabpanel，避免残留上一个面板的 aria', async () => {
    const wrapper = mountRibbon()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await wrapper.find('.oj-ribbon__collapse').trigger('click')
    await nextTick()

    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.attributes('id')).toBe('oj-ribbon-panel-insert')
    expect(panel.attributes('aria-labelledby')).toBe('oj-ribbon-tab-insert')

    wrapper.unmount()
  })
})
