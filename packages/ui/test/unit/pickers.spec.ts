import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { OjColorPicker, OjFontPicker, OjSymbolPicker } from '../../src/vue/index.ts'

/**
 * 颜色 / 字体 / 符号选择器（M2 第二批）。
 *
 * 三个组件的共同约定：**值由使用方持有**，组件只发事件。所以断言都落在 emitted 上，
 * 特别关注"什么值会被写出去"——颜色必须归一化或保持 token 引用，字体必须是 token id，
 * 符号必须是单个字符。
 */

describe('OjColorPicker', () => {
  it('色板渲染成 listbox，当前值命中 aria-selected', () => {
    const wrapper = mount(OjColorPicker, { props: { label: '字体颜色', modelValue: 'var(--oj-brand-6)' } })

    expect(wrapper.attributes('role')).toBe('listbox')
    const swatches = wrapper.findAll('[role="option"]')
    // 品牌 3~9 共 7 个 + 中性 7 个
    expect(swatches).toHaveLength(14)
    expect(swatches.filter((swatch) => swatch.attributes('aria-selected') === 'true')).toHaveLength(1)
    // 色块没有文字，必须靠 aria-label 才可辨认
    expect(swatches[0]!.attributes('aria-label')).toBe('var(--oj-brand-3)')

    wrapper.unmount()
  })

  it('点色块发的是 token 引用，不是十六进制', async () => {
    const wrapper = mount(OjColorPicker, { props: { label: '字体颜色', modelValue: '#000000' } })
    await wrapper.findAll('[role="option"]')[3]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['var(--oj-brand-6)']])
    wrapper.unmount()
  })

  it('自定义色提交时归一化；不合法的不提交', async () => {
    const wrapper = mount(OjColorPicker, {
      props: { label: '字体颜色', modelValue: '#000000', customLabel: '自定义' },
    })
    const input = wrapper.find('.oj-color-picker__hex')

    await input.setValue('#abc')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toEqual([['#aabbcc']])

    // 颜色名不接受（与 normalizeHex 的口径一致）
    await input.setValue('red')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    // token 引用原样透传：主题色是可以被直接输入的
    await input.setValue('var(--oj-brand-6)')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['var(--oj-brand-6)'])

    wrapper.unmount()
  })
})

describe('OjFontPicker', () => {
  it('每项用自家字体栈预览，字体栈来自 token', () => {
    const wrapper = mount(OjFontPicker, { props: { label: '字体', modelValue: 'sans' } })

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(4)
    expect(options[0]!.attributes('style')).toContain('var(--oj-font-sans)')
    expect(options[3]!.attributes('style')).toContain('var(--oj-font-doc)')
    expect(options[0]!.attributes('aria-selected')).toBe('true')

    wrapper.unmount()
  })

  it('搜索过滤列表，上下键在列表里移动', async () => {
    const wrapper = mount(OjFontPicker, { props: { label: '字体', modelValue: 'sans' } })

    await wrapper.find('input').setValue('mono')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)

    await wrapper.find('input').setValue('')
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['mono']])

    // 到末尾停住（不环绕，避免用户误以为列表回到了顶部）
    await wrapper.setProps({ modelValue: 'doc' })
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('OjSymbolPicker', () => {
  it('按分组渲染，首项默认高亮；没有 modelValue（插入动作而非持久值）', () => {
    const wrapper = mount(OjSymbolPicker, { props: { label: '符号' } })

    expect(wrapper.attributes('role')).toBe('listbox')
    expect(wrapper.findAll('[role="group"]')).toHaveLength(5)
    const cells = wrapper.findAll('[role="option"]')
    expect(cells.length).toBeGreaterThanOrEqual(30)
    expect(cells[0]!.attributes('aria-selected')).toBe('true')
    expect(cells[0]!.attributes('aria-label')).toBe('copyright')

    wrapper.unmount()
  })

  it('点击发单个字符', async () => {
    const wrapper = mount(OjSymbolPicker, { props: { label: '符号' } })
    const cells = wrapper.findAll('[role="option"]')
    await cells[1]!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['®']])
    wrapper.unmount()
  })

  it('搜索后回车插入当前高亮项', async () => {
    const wrapper = mount(OjSymbolPicker, { props: { label: '符号' } })

    await wrapper.find('input').setValue('euro')
    const cells = wrapper.findAll('[role="option"]')
    expect(cells).toHaveLength(1)

    await wrapper.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['€']])

    wrapper.unmount()
  })
})
