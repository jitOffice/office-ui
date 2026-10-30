import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { OjCommandPalette } from '../../src/vue/index.ts'
import type { OjPaletteItem } from '../../src/index.ts'

/**
 * `OjCommandPalette`（03 §3 B 组）。搜索排序在 `test/palette.test.ts` 里钉死了；
 * 这里验浮层接线：焦点、键盘循环、IME 回车、选中后关闭。
 *
 * 面板走 `OjPortal` 投到 body，断言一律用 `document`。
 */

const items: OjPaletteItem[] = [
  { id: 'format.bold', label: '加粗', group: '字体', keys: 'mod+b' },
  { id: 'format.italic', label: '斜体', group: '字体' },
  { id: 'insert.table', label: '插入表格', group: '插入', disabled: true },
]

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

function mountPalette(props: Record<string, unknown> = {}) {
  return mount(OjCommandPalette, {
    props: { open: true, items, label: '命令面板', ...props },
    attachTo: document.body,
  })
}

function press(key: string, init: KeyboardEventInit = {}): void {
  const target = document.querySelector('.oj-palette__input') ?? document.body
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
}

describe('OjCommandPalette', () => {
  it('关闭时不渲染，打开是 dialog + combobox + listbox', async () => {
    const closed = mountPalette({ open: false })
    expect(document.querySelector('.oj-palette')).toBeNull()
    closed.unmount()

    const wrapper = mountPalette()
    await nextTick()

    expect(document.querySelector('.oj-palette')?.getAttribute('role')).toBe('dialog')
    expect(document.querySelector('.oj-palette')?.getAttribute('aria-modal')).toBe('true')

    const input = document.querySelector('.oj-palette__input') as HTMLInputElement
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-controls')).toBe('oj-palette-list')
    // 焦点在输入框：面板打开后应该可以直接打字
    expect(document.activeElement).toBe(input)

    expect(document.querySelectorAll('.oj-palette__item')).toHaveLength(3)
    expect(input.getAttribute('aria-activedescendant')).toBe('oj-palette-format.bold')
    // 快捷键按平台显示，不是原始的 mod+b
    expect(document.querySelector('.oj-palette__keys')?.textContent).toMatch(/B$/)

    wrapper.unmount()
  })

  it('输入查询就收敛列表，并把词发出去', async () => {
    const wrapper = mountPalette()
    await nextTick()

    const input = document.querySelector('.oj-palette__input') as HTMLInputElement
    input.value = '斜体'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:query')?.at(-1)).toEqual(['斜体'])
    expect(
      [...document.querySelectorAll('.oj-palette__item')].map((node) => node.getAttribute('data-item')),
    ).toEqual(['format.italic'])

    input.value = '不存在'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(document.querySelectorAll('.oj-palette__item')).toHaveLength(0)
    expect(document.querySelector('.oj-palette__empty')?.textContent).toBe('没有匹配的命令')

    wrapper.unmount()
  })

  it('↑↓ 循环高亮，Enter 选中并关闭', async () => {
    const wrapper = mountPalette()
    await nextTick()

    press('ArrowDown')
    await nextTick()
    expect(
      (document.querySelector('.oj-palette__input') as HTMLInputElement).getAttribute('aria-activedescendant'),
    ).toBe('oj-palette-format.italic')

    press('ArrowUp')
    press('ArrowUp')
    await nextTick()
    expect(
      (document.querySelector('.oj-palette__input') as HTMLInputElement).getAttribute('aria-activedescendant'),
    ).toBe('oj-palette-insert.table')

    press('ArrowDown')
    await nextTick()
    expect(
      (document.querySelector('.oj-palette__input') as HTMLInputElement).getAttribute('aria-activedescendant'),
    ).toBe('oj-palette-format.bold')

    press('Enter')
    await nextTick()
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['format.bold'])
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('禁用的命令可以高亮但不会被执行', async () => {
    const wrapper = mountPalette()
    await nextTick()

    const input = document.querySelector('.oj-palette__input') as HTMLInputElement
    input.value = '插入'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    press('Enter')
    await nextTick()
    expect(wrapper.emitted('select')).toBeUndefined()

    ;(document.querySelector('.oj-palette__item') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('select')).toBeUndefined()

    wrapper.unmount()
  })

  it('IME 合成中的 Enter 不执行命令', async () => {
    const wrapper = mountPalette()
    await nextTick()

    const input = document.querySelector('.oj-palette__input') as HTMLInputElement
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    Object.defineProperty(event, 'isComposing', { value: true })
    input.dispatchEvent(event)
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()

    wrapper.unmount()
  })

  it('Escape 关闭，且点击遮罩空白处也关闭', async () => {
    const wrapper = mountPalette()
    await nextTick()

    press('Escape')
    await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])

    ;(document.querySelector('.oj-palette__mask') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:open')).toHaveLength(2)

    wrapper.unmount()
  })
})
