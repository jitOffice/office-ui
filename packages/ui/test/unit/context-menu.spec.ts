import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { OjContextMenu } from '../../src/vue/index.ts'
import type { OjMenuItem } from '../../src/vue/index.ts'

/**
 * `OjContextMenu`（03 §3 B 组）。
 *
 * 行为规则本身在 `test/menu.test.ts` 里用零依赖用例钉死了，这里只验**接线**：
 * 坐标有没有真的写到面板上、焦点有没有落在第一个可选项、关掉之后事件对不对、
 * 以及"没有 DOM 锚点"这条前提有没有被破坏（面板挂在 body 上，按 clientX/clientY 定位）。
 */

const items: OjMenuItem[] = [
  { id: 'cut', label: '剪切', shortcut: 'Ctrl+X' },
  { id: 'copy', label: '复制', shortcut: 'Ctrl+C' },
  { id: 'paste', label: '粘贴', disabled: true },
  { kind: 'separator' },
  { id: 'delete', label: '删除', danger: true, separatorBefore: true },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mountMenu(props: Record<string, unknown> = {}) {
  return mount(OjContextMenu, {
    props: { open: true, items, x: 40, y: 60, label: '右键菜单', ...props },
    attachTo: document.body,
  })
}

function menuEl(): HTMLElement {
  const el = document.body.querySelector<HTMLElement>('.oj-context-menu')
  if (el === null) throw new Error('菜单没有渲染到 body 上')
  return el
}

function focusedText(): string | null {
  return document.activeElement instanceof HTMLElement ? document.activeElement.textContent : null
}

describe('OjContextMenu', () => {
  it('挂在 body 上、按坐标定位，并把焦点放到第一个可选项', async () => {
    const wrapper = mountMenu()
    await nextTick()
    await nextTick()

    const el = menuEl()
    expect(el.getAttribute('role')).toBe('menu')
    expect(el.getAttribute('aria-label')).toBe('右键菜单')
    expect(el.closest('.oj-portal')).not.toBeNull()
    // 走的是 `OjPopper` 的矩形锚点那条路（没有元素可量），而不是元素锚点
    expect(el.closest('.oj-popper')).not.toBeNull()

    // 40 → x 不越界原样保留；60 + gap 4 → 64。`placePopper` 的 padding 是 8
    expect(el.parentElement?.style.left).toBe('40px')
    expect(el.parentElement?.style.top).toBe('64px')

    expect(focusedText()).toContain('剪切')

    wrapper.unmount()
  })

  it('靠近视口右下角时被夹回来，不会跑到屏幕外', async () => {
    const wrapper = mountMenu({ x: 5000, y: 5000 })
    await nextTick()
    await nextTick()

    const panel = menuEl().parentElement as HTMLElement
    expect(panel.style.left).toBe(`${window.innerWidth - 8}px`)
    expect(panel.style.top).toBe(`${window.innerHeight - 8}px`)

    wrapper.unmount()
  })

  it('上下键跳过禁用项与分隔线，Enter 选中后发 select 并关闭', async () => {
    const wrapper = mountMenu()
    await nextTick()
    await nextTick()

    const el = menuEl()
    // 剪切 → 复制
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    expect(focusedText()).toContain('复制')

    // 复制 → 删除（跳过禁用的粘贴与分隔线）
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    expect(focusedText()).toContain('删除')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('select')).toEqual([['delete']])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['select']])

    wrapper.unmount()
  })

  it('Escape 关闭菜单但不再向外冒泡：一次 Esc 不该同时关掉外层对话框', async () => {
    const wrapper = mountMenu()
    await nextTick()
    await nextTick()

    const seen: string[] = []
    const listener = (event: KeyboardEvent): number => seen.push(event.key)
    document.addEventListener('keydown', listener)

    menuEl().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    document.removeEventListener('keydown', listener)

    expect(wrapper.emitted('close')).toEqual([['escape']])
    expect(seen).toEqual([])

    wrapper.unmount()
  })

  it('点菜单外面关闭，点菜单里面不关', async () => {
    const wrapper = mountMenu()
    await nextTick()

    menuEl().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('close')).toBeUndefined()

    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('close')).toEqual([['outside']])

    wrapper.unmount()
  })

  it('禁用项点不动，也不发 select', async () => {
    const wrapper = mountMenu()
    await nextTick()
    await nextTick()

    const paste = menuEl().querySelector<HTMLButtonElement>('[data-menu-index="2"]') as HTMLButtonElement
    expect(paste.disabled).toBe(true)
    expect(paste.getAttribute('aria-disabled')).toBe('true')
    paste.click()
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('关闭后把焦点还给打开前的元素', async () => {
    const host = document.createElement('textarea')
    document.body.appendChild(host)
    host.focus()

    const wrapper = mountMenu()
    await nextTick()
    await nextTick()
    expect(document.activeElement).not.toBe(host)

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.activeElement).toBe(host)

    wrapper.unmount()
  })

  it('open 为 false 时什么都不渲染', () => {
    const wrapper = mountMenu({ open: false })
    expect(document.body.querySelector('.oj-context-menu')).toBeNull()
    wrapper.unmount()
  })
})
