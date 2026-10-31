import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { OjFontSizeField, OjLineSpacingPicker, OjNumberField } from '../../src/vue/index.ts'

/**
 * 数值与档位输入（M2 第一批）。
 *
 * 三个组件都只发事件、不自己改值（值由使用方持有），所以断言落在 emitted 上。
 * 重点覆盖的是"边界与提交时机"：越界夹取、非法输入不提交、方向键走档位而不是 ±1。
 */

describe('OjNumberField', () => {
  const base = {
    label: '行高',
    decreaseLabel: '减少',
    increaseLabel: '增加',
  }

  it('渲染带 aria 数值，步进按钮各发一次', async () => {
    const wrapper = mount(OjNumberField, { props: { ...base, modelValue: 13 } })

    const input = wrapper.find('input')
    expect(input.attributes('role')).toBe('spinbutton')
    expect(input.attributes('aria-valuenow')).toBe('13')
    expect(input.attributes('aria-label')).toBe('行高')

    const [minus, plus] = wrapper.findAll('button')
    expect(minus!.attributes('aria-label')).toBe('减少')
    expect(plus!.attributes('aria-label')).toBe('增加')

    await plus!.trigger('click')
    await minus!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[14], [12]])

    wrapper.unmount()
  })

  it('输入在失焦时提交；非法输入不提交（回退而不是变 0）', async () => {
    const wrapper = mount(OjNumberField, { props: { ...base, modelValue: 13, min: 1, max: 99 } })
    const input = wrapper.find('input')

    await input.setValue('20px')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')).toEqual([[20]])

    await input.setValue('abc')
    await input.trigger('blur')
    // 仍然是上一次那一条，没有新事件
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    // 越界输入提交时被夹取，而不是报错或写回 999
    await input.setValue('999')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([99])

    wrapper.unmount()
  })

  it('方向键步进，边界上不再越界', async () => {
    const wrapper = mount(OjNumberField, { props: { ...base, modelValue: 1, min: 1, step: 2 } })
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])

    // 已经在 min 上，再按减号不重复发事件（值没变，发了只会让受控方多写一次状态）
    await wrapper.setProps({ modelValue: 1 })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('OjFontSizeField', () => {
  const base = { label: '字号', decreaseLabel: '减小字号', increaseLabel: '增大字号' }

  it('档位下拉与 token 同档，手输值落到最近档位做选中态', () => {
    const wrapper = mount(OjFontSizeField, { props: { ...base, modelValue: 17 } })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(8)
    expect(options.map((option) => option.text())).toEqual(['12', '13', '14', '16', '18', '20', '24', '32'])
    // 17 没有对应 token，下拉显示最近的 16，但输入框保留用户输的 17
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('16')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('17')

    wrapper.unmount()
  })

  it('上下键走档位，不是 ±1', async () => {
    const wrapper = mount(OjFontSizeField, { props: { ...base, modelValue: 14 } })
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[16], [13]])

    wrapper.unmount()
  })

  it('选档位发事件；顶层档位再往上不环绕', async () => {
    const wrapper = mount(OjFontSizeField, { props: { ...base, modelValue: 20 } })

    await wrapper.find('select').setValue('32')
    expect(wrapper.emitted('update:modelValue')).toEqual([[32]])

    await wrapper.setProps({ modelValue: 32 })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('OjLineSpacingPicker', () => {
  it('渲染四个档位，当前值在 aria-selected 上', () => {
    const wrapper = mount(OjLineSpacingPicker, { props: { label: '行距', modelValue: 1.5 } })

    expect(wrapper.attributes('role')).toBe('listbox')
    expect(wrapper.attributes('aria-label')).toBe('行距')
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(4)
    expect(options.map((option) => option.attributes('aria-selected'))).toEqual(['false', 'false', 'true', 'false'])
    expect(options[3]!.text()).toBe('2')

    wrapper.unmount()
  })

  it('点击发事件；上下键在档位间移动', async () => {
    const wrapper = mount(OjLineSpacingPicker, { props: { label: '行距', modelValue: 1.5 } })
    const options = wrapper.findAll('[role="option"]')

    await options[3]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])

    // 1.5 的前一档是 1.15（不是 1）：档位表里就是这两档，跳过 1.15 会让用户少一档可选
    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.slice(1)).toEqual([[2], [1.15]])

    wrapper.unmount()
  })
})
