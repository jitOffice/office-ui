import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { configure, create, hydrate, ojComponentNames, resetConfigure } from '../../src/vue/index.ts'

/**
 * 02 §4.2 / §4.3 的验收：命令式与声明式两条无构建器入口。
 *
 * 它们为什么必须在 Vitest 车道里做：两条入口的全部语义都是"对真实 DOM 做了什么"
 * ——插在哪、销毁后有没有移除、属性解析失败会不会连累其它元素。零依赖那条链连 document 都没有。
 */

function clear(): void {
  document.body.innerHTML = ''
  resetConfigure()
}

afterEach(clear)

describe('create（命令式）', () => {
  it('在 anchor 之后插入实例，而不是塞进 anchor 内部', () => {
    document.body.innerHTML = '<button id="insert-table">插入表格</button>'
    const anchor = document.querySelector('#insert-table') as Element
    const instance = create('oj-icon', { anchor: '#insert-table', props: { name: 'oj-format-bold' } })

    expect(instance.el.previousElementSibling).toBe(anchor)
    expect(anchor.querySelector('[data-oj-instance]')).toBeNull()
    expect(instance.el.querySelector('.oj-icon')).not.toBeNull()

    instance.destroy()
  })

  it('setProps 更新已挂载的实例', async () => {
    const instance = create('oj-icon', { props: { name: 'oj-format-bold', size: 16 } })
    expect(instance.el.innerHTML).toContain('16px')

    instance.setProps({ size: 32 })
    await nextTick()
    expect(instance.el.innerHTML).toContain('32px')

    instance.destroy()
  })

  it('destroy 后容器被移除，且重复 destroy 不抛错', () => {
    const instance = create('oj-icon', { props: { name: 'oj-format-bold' } })
    expect(document.body.contains(instance.el)).toBe(true)

    instance.destroy()
    expect(document.body.contains(instance.el)).toBe(false)
    expect(() => instance.destroy()).not.toThrow()
  })

  it('destroy 之后 setProps 是空操作（不复活已卸载的 app）', async () => {
    const instance = create('oj-icon', { props: { name: 'oj-format-bold', size: 16 } })
    instance.destroy()
    // 快照要在 destroy **之后**取：unmount 本身会清空容器内容
    const afterDestroy = instance.el.innerHTML

    instance.setProps({ size: 64 })
    await nextTick()
    expect(instance.el.innerHTML).toBe(afterDestroy)
  })

  it('未知组件名直接报错，并指向已注册的名字清单', () => {
    expect(() => create('oj-not-a-component')).toThrowError(/未知组件/)
    expect(() => create('oj-not-a-component')).toThrowError(/ojComponentNames/)
  })

  it('anchor 找不到时报错而不是静默挂到 body', () => {
    expect(() => create('oj-icon', { anchor: '#nope' })).toThrowError(/anchor 找不到/)
  })

  it('注册表覆盖全部公开组件，且 resolve 接受不带 oj- 前缀的简写', () => {
    const names = ojComponentNames()
    expect(names.length).toBeGreaterThanOrEqual(34)
    expect(names).toContain('oj-table-grid-picker')

    const viaShort = create('icon', { props: { name: 'oj-format-bold' } })
    expect(viaShort.el.querySelector('.oj-icon')).not.toBeNull()
    viaShort.destroy()
  })
})

describe('hydrate（声明式）', () => {
  it('读 data-oj-props 的 JSON 并挂载', () => {
    document.body.innerHTML =
      '<div id="toolbar" data-oj="icon" data-oj-props=\'{"name":"oj-format-bold","size":20}\'></div>'
    const instances = hydrate('#toolbar')

    expect(instances).toHaveLength(1)
    const mounted = document.querySelector('[data-oj-instance]')
    expect(mounted?.innerHTML).toContain('20px')
    expect(document.querySelector('#toolbar')?.getAttribute('data-oj-hydrated')).toBe('')
  })

  it('data-oj-prop-* 逐属性写法：单层、类型推断、省略 oj- 前缀', () => {
    document.body.innerHTML = '<div data-oj="icon" data-oj-prop-name="oj-format-bold" data-oj-prop-size="24"></div>'
    hydrate()

    // `24` 是数字而不是字符串 `"24"`，否则组件里 `${size}px` 会变成 24px 之外的东西
    expect(document.querySelector('[data-oj-instance]')?.innerHTML).toContain('24px')
  })

  it('data-oj-props 不是合法 JSON 时：报错定位到元素，且不连累同页其它容器', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    document.body.innerHTML = [
      '<div data-oj="icon" data-oj-props="{bad json}"></div>',
      '<div data-oj="icon" data-oj-props=\'{"name":"oj-format-bold"}\'></div>',
    ].join('')

    const instances = hydrate()

    expect(instances).toHaveLength(1)
    expect(error).toHaveBeenCalledOnce()
    expect(String(error.mock.calls[0]?.[0])).toContain('data-oj-props 解析失败')
    // 报错信息要带元素本身，否则在大页面里无从定位
    expect(String(error.mock.calls[0]?.[0])).toContain('data-oj-props="{bad json}"')
    error.mockRestore()
  })

  it('重复 hydrate 不会重复挂载', () => {
    document.body.innerHTML = '<div data-oj="icon" data-oj-props=\'{"name":"oj-format-bold"}\'></div>'

    expect(hydrate()).toHaveLength(1)
    expect(hydrate()).toHaveLength(0)
    expect(document.querySelectorAll('[data-oj-instance]')).toHaveLength(1)
  })

  it('未知组件只跳过自己，不影响同页其它容器', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    document.body.innerHTML = [
      '<div data-oj="oj-nope"></div>',
      '<div data-oj="icon" data-oj-props=\'{"name":"oj-format-bold"}\'></div>',
    ].join('')

    expect(hydrate()).toHaveLength(1)
    expect(error).toHaveBeenCalledOnce()
    error.mockRestore()
  })

  it('data-oj-prop-on-* 指向不存在的全局函数时只警告，不挂载该事件', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    document.body.innerHTML =
      '<div data-oj="icon" data-oj-prop-name="oj-format-bold" data-oj-prop-on-select="window.nope"></div>'

    const instances = hydrate()
    expect(instances).toHaveLength(1)
    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0]?.[0])).toContain('不是可调用的全局函数')
    warn.mockRestore()
  })

  it('根节点选择器不存在时返回空数组并提示，而不是抛错', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(hydrate('#missing')).toEqual([])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})

describe('configure', () => {
  it('登记的 theme/density 会写进挂载容器（供将来的元素级主题使用）', () => {
    configure({ theme: 'dark', density: 'compact' })
    const instance = create('oj-icon', { props: { name: 'oj-format-bold' } })

    expect(instance.el.getAttribute('data-oj-theme')).toBe('dark')
    expect(instance.el.getAttribute('data-oj-density')).toBe('compact')
    instance.destroy()
  })
})
