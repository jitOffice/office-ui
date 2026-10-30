import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { OjHotkey } from '../../src/vue/index.ts'

/**
 * `OjHotkey` 的接线（03 §3 B 组）。
 *
 * 解析/匹配/显示在 `test/hotkey.test.ts` 里用零依赖钉死了；这里只验"事件真的挂上了、
 * 该让路的时候让路、该拦的时候拦"。
 */

const bindings = [
  { id: 'format.bold', keys: 'mod+b' },
  { id: 'format.undo', keys: 'mod+z' },
]

function press(init: KeyboardEventInit & { isComposing?: boolean }): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  if (init.isComposing) Object.defineProperty(event, 'isComposing', { value: true })
  window.dispatchEvent(event)
  return event
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OjHotkey', () => {
  it('命中绑定就发 run 并 preventDefault', async () => {
    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'win' } })

    const event = press({ key: 'b', ctrlKey: true })
    expect(wrapper.emitted('run')?.at(-1)).toEqual(['format.bold'])
    expect(event.defaultPrevented).toBe(true)

    press({ key: 'z', ctrlKey: true })
    expect(wrapper.emitted('run')?.at(-1)).toEqual(['format.undo'])

    wrapper.unmount()
  })

  it('多一个修饰键就不算命中，也不拦浏览器默认行为', () => {
    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'win' } })

    const event = press({ key: 'b', ctrlKey: true, shiftKey: true })
    expect(wrapper.emitted('run')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)

    wrapper.unmount()
  })

  it('mac 上 mod 是 ⌘：Ctrl+B 不触发', () => {
    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'mac' } })

    press({ key: 'b', ctrlKey: true })
    expect(wrapper.emitted('run')).toBeUndefined()

    press({ key: 'b', metaKey: true })
    expect(wrapper.emitted('run')?.at(-1)).toEqual(['format.bold'])

    wrapper.unmount()
  })

  it('IME 合成期间不抢键（03 §5 第 7 条）', () => {
    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'win' } })

    press({ key: 'b', ctrlKey: true, isComposing: true })
    expect(wrapper.emitted('run')).toBeUndefined()

    wrapper.unmount()
  })

  it('别的处理器已经 preventDefault 过，就让路', () => {
    // 先注册的监听器先跑：模拟"浮层已经把 Esc 吃掉了"的场景
    const swallow = (event: Event): void => event.preventDefault()
    window.addEventListener('keydown', swallow, { once: true })

    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'win' } })
    press({ key: 'b', ctrlKey: true })
    expect(wrapper.emitted('run')).toBeUndefined()

    wrapper.unmount()
  })

  it('disabled 与卸载之后都不再响应', async () => {
    const wrapper = mount(OjHotkey, { props: { bindings, platform: 'win', enabled: false } })

    press({ key: 'b', ctrlKey: true })
    expect(wrapper.emitted('run')).toBeUndefined()

    await wrapper.setProps({ enabled: true })
    press({ key: 'b', ctrlKey: true })
    expect(wrapper.emitted('run')).toHaveLength(1)

    // unmount 之后 `emitted()` 就取不到了，先把记录留住再卸载
    const runs = wrapper.emitted('run')!
    wrapper.unmount()
    await nextTick()
    press({ key: 'b', ctrlKey: true })
    expect(runs).toHaveLength(1)
  })

  it('多条绑定命中同一个键时先到先得', () => {
    const wrapper = mount(OjHotkey, {
      props: {
        bindings: [
          { id: 'first', keys: 'mod+k' },
          { id: 'second', keys: ['mod+k'] },
        ],
        platform: 'win',
      },
    })

    press({ key: 'k', ctrlKey: true })
    expect(wrapper.emitted('run')).toEqual([['first']])

    wrapper.unmount()
  })
})
