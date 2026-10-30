import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { OjRibbonGallery } from '../../src/vue/index.ts'

/**
 * `OjRibbonGallery`（03 §3 B 组 🟡）。
 *
 * 方向键的规则在 `test/gallery.test.ts` 里用零依赖钉死了；这里验 roving tabindex
 * 与"焦点真的挪过去了"——只改 tabindex 不调 `focus()` 的话，键盘用户什么都不会发生。
 * 另外要验禁用格：`<button disabled>` 收不到焦点，算出来的下标必须继续往前走。
 */

const items = [
  { id: 'style.a', label: '标题 1' },
  { id: 'style.b', label: '标题 2' },
  { id: 'style.c', label: '标题 3', disabled: true },
  { id: 'style.d', label: '正文' },
  { id: 'style.e', label: '引用' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mountGallery(props: Record<string, unknown> = {}) {
  return mount(OjRibbonGallery, {
    props: { items, columns: 3, label: '样式库', ...props },
    attachTo: document.body,
  })
}

describe('OjRibbonGallery', () => {
  it('按列数铺成网格，只有当前格可 Tab 进入', () => {
    const wrapper = mountGallery()

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('样式库')
    expect((wrapper.element as HTMLElement).style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))')

    const cells = wrapper.findAll('.oj-ribbon-gallery__item')
    expect(cells).toHaveLength(5)
    expect(cells.map((cell) => cell.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1'])

    wrapper.unmount()
  })

  it('点击发 select，禁用的格子不发也不抢焦点', async () => {
    const wrapper = mountGallery()

    await wrapper.findAll('.oj-ribbon-gallery__item')[1]!.trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['style.b'])

    await wrapper.findAll('.oj-ribbon-gallery__item')[2]!.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)

    wrapper.unmount()
  })

  it('方向键按行移动，焦点跟着走；End 到最后、Home 回第一个', async () => {
    const wrapper = mountGallery()
    await nextTick()

    const cells = wrapper.findAll('.oj-ribbon-gallery__item')
    await cells[0]!.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect((document.activeElement as HTMLElement).dataset.item).toBe('style.d')

    await wrapper.findAll('.oj-ribbon-gallery__item')[3]!.trigger('keydown', { key: 'End' })
    await nextTick()
    expect((document.activeElement as HTMLElement).dataset.item).toBe('style.e')

    await wrapper.findAll('.oj-ribbon-gallery__item')[4]!.trigger('keydown', { key: 'Home' })
    await nextTick()
    expect((document.activeElement as HTMLElement).dataset.item).toBe('style.a')
    expect(wrapper.findAll('.oj-ribbon-gallery__item')[0]!.attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })

  it('方向键落在禁用格上时继续往前找，不会停在原地', async () => {
    const wrapper = mountGallery()
    await nextTick()

    // 0 → 1，再右移到 2（禁用）→ 应该落到 3
    await wrapper.findAll('.oj-ribbon-gallery__item')[0]!.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await wrapper.findAll('.oj-ribbon-gallery__item')[1]!.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect((document.activeElement as HTMLElement).dataset.item).toBe('style.d')

    wrapper.unmount()
  })

  it('命令变少后，roving 下标不指向不存在的格子', async () => {
    const wrapper = mountGallery()

    await wrapper.setProps({ items: items.slice(0, 2) })
    await nextTick()

    const cells = wrapper.findAll('.oj-ribbon-gallery__item')
    expect(cells).toHaveLength(2)
    expect(cells.map((cell) => cell.attributes('tabindex'))).toEqual(['0', '-1'])

    wrapper.unmount()
  })
})
