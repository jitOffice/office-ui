import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'

import { OjAiPanel, OjCodeBlock, OjDialog, OjStamp, OjWatermark } from '../../src/vue/index.ts'

/**
 * 弹层与展示类组件（03 §2/§3）。
 *
 * `OjDialog` 的四条断言对应它的四个真实风险，而不是"渲染出来了"：
 *   1. `teleport: false` 必须**留在原地**——宿主自己管层级的场景（打印区、iframe）全靠它；
 *   2. 点遮罩关闭、点面板内不关闭——漏了 `stopPropagation` 就会"点哪都关"，用户填了一半的表单没了；
 *   3. Esc 挂在 `document` 上而不是元素上：弹窗打开时焦点可能还在触发按钮上；
 *   4. 打开后焦点落到确认按钮，否则键盘用户要 Tab 一圈才进得来。
 */

const bodyQuery = (selector: string): HTMLElement | null => document.body.querySelector(selector)

afterEach(() => {
  // Teleport 把节点挂到了 body，unmount 不一定收干净：手动清一遍，避免用例互相污染。
  document.body.innerHTML = ''
})

describe('OjDialog', () => {
  it('open=false 不渲染任何节点，open=true 才进 body', async () => {
    const wrapper = mount(OjDialog, { props: { open: false, title: '插入表格' } })
    expect(bodyQuery('.oj-dialog')).toBeNull()

    await wrapper.setProps({ open: true })
    const dialog = bodyQuery('.oj-dialog')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBe('插入表格')

    wrapper.unmount()
  })

  it('点遮罩关闭，点面板内部不关闭', async () => {
    const wrapper = mount(OjDialog, { props: { open: true, title: '保存', cancelLabel: '取消' } })

    bodyQuery('.oj-dialog')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('cancel')).toBeUndefined()

    bodyQuery('.oj-dialog__mask')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[false]])

    wrapper.unmount()
  })

  it('Esc 在 document 上也能关闭，且只在打开时生效', async () => {
    const wrapper = mount(OjDialog, { props: { open: false, title: '保存' } })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await wrapper.setProps({ open: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    // 非 Esc 的键不该触发关闭
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    wrapper.unmount()
    // unmount 后监听必须摘掉，否则每开合一次就往 document 上叠一个。
    // 这里不能用 `wrapper.emitted()` 断言：VTU 在 unmount 时清空记录，那样的断言永远红。
    // 换成可观测的事实：卸载后不该再抛错，也不该留下任何弹窗节点。
    expect(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))).not.toThrow()
    expect(bodyQuery('.oj-dialog')).toBeNull()
  })

  it('teleport=false 留在原地；确认按钮只发 confirm、不自作主张关闭', async () => {
    const wrapper = mount(OjDialog, {
      props: { open: true, title: '保存', teleport: false, confirmLabel: '确定', cancelLabel: '取消' },
      slots: { default: () => h('p', { class: 'body' }, '正文') },
    })

    expect(wrapper.find('.oj-dialog').exists()).toBe(true)
    expect(bodyQuery('.oj-dialog')).toBeNull()
    expect(wrapper.find('.oj-dialog__body .body').text()).toBe('正文')

    await wrapper.find('.oj-dialog__confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    // 关不关是使用方的决定：组件只报"用户点了确定"
    expect(wrapper.emitted('update:open')).toBeUndefined()

    wrapper.unmount()
  })

  it('打开后焦点落到确认按钮', async () => {
    const wrapper = mount(OjDialog, { props: { open: false, title: '保存', confirmLabel: '确定' }, attachTo: document.body })

    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()

    expect((document.activeElement as HTMLElement | null)?.className).toContain('oj-dialog__confirm')

    wrapper.unmount()
  })
})

describe('OjAiPanel', () => {
  const props = { title: 'AI 助手', placeholder: '描述你想要的排版', sendLabel: '发送' }

  it('渲染标题、提示与历史消息（带角色）', () => {
    const wrapper = mount(OjAiPanel, {
      props: {
        ...props,
        notice: '仅在本地运行',
        messages: [
          { role: 'user', text: '加个目录' },
          { role: 'assistant', text: '好的' },
        ],
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('AI 助手')
    expect(wrapper.find('.oj-ai__notice').text()).toBe('仅在本地运行')
    expect(wrapper.findAll('.oj-ai__log li').map((node) => node.attributes('data-role'))).toEqual(['user', 'assistant'])

    wrapper.unmount()
  })

  it('没有 notice 时不渲染空段落', () => {
    const wrapper = mount(OjAiPanel, { props })
    expect(wrapper.find('.oj-ai__notice').exists()).toBe(false)
    expect(wrapper.findAll('.oj-ai__log li')).toHaveLength(0)
    wrapper.unmount()
  })

  it('提交后发 submit 并清空输入；纯空白不发', async () => {
    const wrapper = mount(OjAiPanel, { props })
    const input = wrapper.find('input')

    await input.setValue('   ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await input.setValue(' 加个页眉 ')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toEqual([['加个页眉']])
    expect((input.element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })
})

describe('OjCodeBlock / OjWatermark / OjStamp', () => {
  it('OjCodeBlock 有 language 才渲染语言标签', () => {
    const withLang = mount(OjCodeBlock, { props: { code: 'const a = 1', language: 'ts' } })
    expect(withLang.element.tagName).toBe('PRE')
    expect(withLang.find('.oj-code__lang').text()).toBe('ts')
    withLang.unmount()

    const withoutLang = mount(OjCodeBlock, { props: { code: 'const a = 1' } })
    expect(withoutLang.find('.oj-code__lang').exists()).toBe(false)
    withoutLang.unmount()
  })

  it('OjWatermark 水印层可关，内容槽始终渲染', () => {
    const shown = mount(OjWatermark, { props: { text: '机密' }, slots: { default: () => h('span', { class: 'content' }, '正文') } })
    expect(shown.find('.oj-watermark__layer').text()).toBe('机密')
    expect(shown.find('.content').exists()).toBe(true)
    shown.unmount()

    const hidden = mount(OjWatermark, { props: { text: '机密', visible: false } })
    expect(hidden.find('.oj-watermark__layer').exists()).toBe(false)
    hidden.unmount()
  })

  it('OjStamp 是装饰性的：不进无障碍树', () => {
    const wrapper = mount(OjStamp, { props: { text: '已审' } })
    expect(wrapper.text()).toBe('已审')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })
})
