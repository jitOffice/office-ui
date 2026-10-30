import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { OjRuler, OjSearchReplaceBar, OjTabs, OjZoomControl } from '../../src/vue/index.ts'

/**
 * 编辑器控件（03 §3）。
 *
 * 这四条的共同点是「值由使用方持有」：组件只发事件、不自己改状态。
 * 所以断言都落在 emitted 上，而不是"点完之后组件里显示什么"——
 * 后者会把双份状态引进来，而双份状态就是这类控件最难查的那类 bug。
 */

describe('OjTabs', () => {
  const items = [
    { id: 'home', label: '开始' },
    { id: 'insert', label: '插入' },
    { id: 'layout', label: '布局' },
  ]

  it('渲染 tablist，选中项 tabindex=0、其余 -1', () => {
    const wrapper = mount(OjTabs, { props: { items, modelValue: 'insert' } })

    expect(wrapper.attributes('role')).toBe('tablist')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.map((tab) => tab.attributes('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(tabs.map((tab) => tab.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    expect(tabs[1]!.attributes('id')).toBe('oj-tab-insert')

    wrapper.unmount()
  })

  it('点选发 update:modelValue', async () => {
    const wrapper = mount(OjTabs, { props: { items, modelValue: 'home' } })
    await wrapper.findAll('[role="tab"]')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['layout']])
    wrapper.unmount()
  })

  it('键盘：方向键循环、Home/End 到两端、无关键不吞事件', async () => {
    const wrapper = mount(OjTabs, { props: { items, modelValue: 'home' } })
    const list = wrapper.find('[role="tablist"]')

    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['insert']])

    // 从左端往左是环绕，不是卡住
    await wrapper.setProps({ modelValue: 'home' })
    await list.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['insert'], ['layout']])

    await list.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['layout'])

    await wrapper.setProps({ modelValue: 'insert' })
    await list.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['home'])

    // 右端往右也是环绕：layout → home
    await wrapper.setProps({ modelValue: 'layout' })
    await list.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['home'])

    // 无关键一个事件都不发（发了就是无谓的重渲染 + 抢走输入）
    const before = wrapper.emitted('update:modelValue')?.length ?? 0
    await list.trigger('keydown', { key: 'a' })
    await list.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(before)

    wrapper.unmount()
  })
})

describe('OjSearchReplaceBar', () => {
  const labels = {
    findLabel: '查找',
    replaceLabel: '替换为',
    nextLabel: '下一个',
    previousLabel: '上一个',
    matchCaseLabel: '区分大小写',
    countLabel: '第 1 项，共 3 项',
    replaceActionLabel: '替换',
    replaceAllLabel: '全部替换',
  }

  it('两个输入框各自发 update:*', async () => {
    const wrapper = mount(OjSearchReplaceBar, { props: labels })
    const inputs = wrapper.findAll('input')

    await inputs[0]!.setValue('页边距')
    await inputs[1]!.setValue('2.54cm')

    expect(wrapper.emitted('update:find')).toEqual([['页边距']])
    expect(wrapper.emitted('update:replace')).toEqual([['2.54cm']])

    wrapper.unmount()
  })

  it('四个动作按钮 + 区分大小写开关', async () => {
    const wrapper = mount(OjSearchReplaceBar, { props: { ...labels, matchCase: true } })
    const buttons = wrapper.findAll('button')

    // 顺序即布局：区分大小写 → 上一个 → 下一个 → 替换 → 全部替换
    expect(buttons.map((button) => button.text())).toEqual(['区分大小写', '上一个', '下一个', '替换', '全部替换'])
    expect(buttons[0]!.attributes('aria-pressed')).toBe('true')
    expect(buttons[0]!.attributes('data-active')).toBe('')

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')
    await buttons[3]!.trigger('click')
    await buttons[4]!.trigger('click')

    expect(wrapper.emitted('update:matchCase')).toEqual([[false]])
    expect(wrapper.emitted('previous')).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('replace')).toHaveLength(1)
    expect(wrapper.emitted('replace-all')).toHaveLength(1)

    wrapper.unmount()
  })

  it('未开启时开关没有 aria-pressed / data-active 的假阳性', () => {
    const wrapper = mount(OjSearchReplaceBar, { props: labels })
    const toggle = wrapper.findAll('button')[0]!
    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(toggle.attributes('data-active')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('OjZoomControl', () => {
  const labels = { zoomOutLabel: '缩小', zoomInLabel: '放大', resetLabel: '100%' }

  it('加减各走一步，重置回到 100', async () => {
    const wrapper = mount(OjZoomControl, { props: { ...labels, modelValue: 100 } })
    const buttons = wrapper.findAll('button')

    expect(wrapper.find('.oj-zoom__value').text()).toBe('100%')
    expect(buttons.map((button) => button.attributes('aria-label'))).toEqual(['缩小', '放大', undefined])

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[90], [110], [100]])

    wrapper.unmount()
  })

  it('两端夹住：50 再缩还是 50，200 再放还是 200', async () => {
    const low = mount(OjZoomControl, { props: { ...labels, modelValue: 50 } })
    await low.findAll('button')[0]!.trigger('click')
    expect(low.emitted('update:modelValue')).toEqual([[50]])
    low.unmount()

    const high = mount(OjZoomControl, { props: { ...labels, modelValue: 200 } })
    await high.findAll('button')[1]!.trigger('click')
    expect(high.emitted('update:modelValue')).toEqual([[200]])
    high.unmount()
  })
})

describe('OjRuler', () => {
  it('横向按 96dpi 出刻度，长度决定条宽', () => {
    const wrapper = mount(OjRuler, { props: { length: 200, zoom: 100 } })

    expect(wrapper.classes()).toContain('oj-ruler--h')
    expect(wrapper.attributes('style')).toContain('width: 200px')

    const ticks = wrapper.findAll('.oj-ruler__tick')
    // 200px / 37.795px ≈ 5.29 → 0..5 共 6 格
    expect(ticks).toHaveLength(6)
    expect(ticks.map((tick) => tick.text())).toEqual(['0', '1', '2', '3', '4', '5'])
    expect(ticks[0]!.attributes('style')).toContain('left: 0px')
    expect(ticks[5]!.attributes('style')).toContain('left: 189px')

    wrapper.unmount()
  })

  it('纵向用高度与 top，缩放放大时刻度变稀', () => {
    const wrapper = mount(OjRuler, { props: { length: 200, zoom: 200, orientation: 'vertical' } })

    expect(wrapper.classes()).toContain('oj-ruler--v')
    expect(wrapper.attributes('style')).toContain('height: 200px')
    const ticks = wrapper.findAll('.oj-ruler__tick')
    // 放大一倍 → 每格 75.59px → 200px 内只剩 0..2
    expect(ticks).toHaveLength(3)
    expect(ticks[1]!.attributes('style')).toContain('top: 76px')

    wrapper.unmount()
  })

  it('长度或缩放为 0 时不出刻度（而不是画一条 0 格的空尺）', () => {
    const wrapper = mount(OjRuler, { props: { length: 0, zoom: 100 } })
    expect(wrapper.findAll('.oj-ruler__tick')).toHaveLength(0)
    wrapper.unmount()
  })
})
