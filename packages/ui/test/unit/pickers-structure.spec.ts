import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { OjAlignmentPicker, OjBorderPicker, OjGallery, OjStyleGallery } from '../../src/vue/index.ts'

/**
 * 对齐 / 边框 / 画廊（M2 第三批）。
 *
 * 断言重点：**中间态不能流出去**。对齐是水平+垂直两个维度、边框是线型+线宽+颜色三个维度，
 * 任何一次 `change` 都必须是归一化后的完整值——否则使用方会收到"线型 none 但宽度 1"这种
 * 写进文档就变成隐形 1px 线的组合。
 */

describe('OjAlignmentPicker', () => {
  it('两组共 7 个按钮，当前值命中 aria-pressed', () => {
    const wrapper = mount(OjAlignmentPicker, {
      props: { label: '对齐', modelValue: { horizontal: 'center', vertical: 'bottom' } },
    })

    const buttons = wrapper.findAll('.oj-alignment__button')
    expect(buttons).toHaveLength(7)
    const pressed = buttons.filter((button) => button.attributes('aria-pressed') === 'true')
    expect(pressed.map((button) => button.attributes('aria-label'))).toEqual(['center', 'bottom'])

    wrapper.unmount()
  })

  it('点水平按钮只改水平，垂直保持原值', async () => {
    const wrapper = mount(OjAlignmentPicker, {
      props: { label: '对齐', modelValue: { horizontal: 'left', vertical: 'middle' } },
    })

    await wrapper.findAll('.oj-alignment__button')[3]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[{ horizontal: 'justify', vertical: 'middle' }]])

    wrapper.unmount()
  })

  it('方向键改对应维度，且在两端停住', async () => {
    const wrapper = mount(OjAlignmentPicker, {
      props: { label: '对齐', modelValue: { horizontal: 'right', vertical: 'top' } },
    })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ horizontal: 'justify', vertical: 'top' }])

    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    // 已经在最上面，不重复发事件
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('OjBorderPicker', () => {
  it('选 none 时宽度归零（一次事件里三档都归一）', async () => {
    const wrapper = mount(OjBorderPicker, {
      props: { label: '边框', widthLabel: '线宽', colorLabel: '颜色', modelValue: { style: 'solid', width: 2, color: '#000000' } },
    })

    const styles = wrapper.findAll('.oj-border-picker__style')
    expect(styles).toHaveLength(5)
    expect(styles[1]!.attributes('aria-pressed')).toBe('true')

    await styles[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[{ style: 'none', width: 0, color: '#000000' }]])

    wrapper.unmount()
  })

  it('线宽与颜色各自发完整值', async () => {
    const wrapper = mount(OjBorderPicker, {
      props: { label: '边框', widthLabel: '线宽', colorLabel: '颜色', modelValue: { style: 'dashed', width: 1, color: '#000000' } },
    })

    await wrapper.find('select').setValue('1.5')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ style: 'dashed', width: 1.5, color: '#000000' }])

    const colors = wrapper.findAll('.oj-border-picker__color')
    expect(colors).toHaveLength(5)
    await colors[3]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([{ style: 'dashed', width: 1, color: 'var(--oj-brand-6)' }])

    wrapper.unmount()
  })
})

describe('OjGallery', () => {
  const items = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B', description: '第二个' },
    { id: 'c', label: 'C' },
    { id: 'd', label: 'D' },
    { id: 'e', label: 'E' },
  ]

  it('渲染网格与选中态', () => {
    const wrapper = mount(OjGallery, { props: { items, modelValue: 'b', label: '画廊' } })

    expect(wrapper.attributes('role')).toBe('listbox')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(5)
    expect(wrapper.find('[data-active]').text()).toContain('第二个')

    wrapper.unmount()
  })

  it('方向键按行列走，点击发事件', async () => {
    const wrapper = mount(OjGallery, { props: { items, modelValue: 'a', label: '画廊', columns: 2 } })

    // 2 列：右移是 b，下移是 c（跳一整行）
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['c'])

    await wrapper.findAll('[role="option"]')[4]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['e'])

    wrapper.unmount()
  })
})

describe('OjStyleGallery', () => {
  it('每项用自己的排版渲染示例，显示名缺省回退 id', () => {
    const wrapper = mount(OjStyleGallery, { props: { modelValue: 'body', label: '样式', sample: '正文示例' } })

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(6)
    expect(options[0]!.text()).toContain('正文示例')
    // 标题 1 是 32px 粗体
    const sample = options[0]!.find('.oj-style-gallery__sample')
    expect(sample.attributes('style')).toContain('font-size: 32px')
    expect(sample.attributes('style')).toContain('font-weight: 600')
    // 没有 labels 时显示名就是 id
    expect(options[0]!.text()).toContain('title-1')

    wrapper.unmount()
  })

  it('点击与方向键都发 id', async () => {
    const wrapper = mount(OjStyleGallery, {
      props: { modelValue: 'body', label: '样式', labels: { body: '正文', quote: '引用' } },
    })

    await wrapper.findAll('[role="option"]')[4]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['quote']])

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['quote'])

    wrapper.unmount()
  })
})
