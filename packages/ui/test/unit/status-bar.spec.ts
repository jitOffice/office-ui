import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { OjStatusBar } from '../../src/vue/index.ts'

/**
 * `OjStatusBar`（03 §3 B 组）。只验布局分工与"没给就不渲染"——
 * 文案格式化归使用方，状态栏自己拼字符串是最容易把 i18n 拼坏的写法。
 */

describe('OjStatusBar', () => {
  it('三段式：左模式、中读数、右读数', () => {
    const wrapper = mount(OjStatusBar, {
      props: {
        page: '第 1 页 / 共 3 页',
        words: '1,234 字',
        language: '中文（中国）',
        zoom: 100,
        collaborators: '3 人协作',
        label: '状态栏',
      },
      slots: {
        start: () => h('button', { class: 'view' }, '页面视图'),
        end: () => h('button', { class: 'zoom-out' }, '缩小'),
      },
    })

    expect(wrapper.element.tagName).toBe('FOOTER')
    expect(wrapper.attributes('aria-label')).toBe('状态栏')
    expect(wrapper.find('.oj-status-bar__start .view').exists()).toBe(true)
    expect(wrapper.find('.oj-status-bar__end .zoom-out').exists()).toBe(true)

    expect(wrapper.findAll('.oj-status-bar__item').map((node) => node.attributes('data-part'))).toEqual([
      'page',
      'words',
      'language',
      'zoom',
      'collaborators',
    ])
    expect(wrapper.find('[data-part="zoom"]').text()).toBe('100%')

    wrapper.unmount()
  })

  it('没给的项不渲染，不留空占位', () => {
    const wrapper = mount(OjStatusBar, { props: { words: '12 字' } })

    expect(wrapper.findAll('.oj-status-bar__item')).toHaveLength(1)
    expect(wrapper.find('[data-part="page"]').exists()).toBe(false)
    expect(wrapper.find('.oj-status-bar__start').element.childElementCount).toBe(0)

    wrapper.unmount()
  })

  it('中区可以追加使用方自己的内容，排在计数前面', () => {
    const wrapper = mount(OjStatusBar, {
      props: { words: '12 字' },
      slots: { default: () => h('span', { class: 'extra' }, '已保存') },
    })

    const parts = wrapper.findAll('.oj-status-bar__center > *')
    expect(parts[0]!.classes()).toContain('extra')
    expect(parts[1]!.attributes('data-part')).toBe('words')

    wrapper.unmount()
  })
})
