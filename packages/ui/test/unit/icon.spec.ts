import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import { registerIcon, resetRegisteredIcons } from '../../src/icon-registry.ts'
import { OjIcon } from '../../src/vue/index.ts'

/**
 * `OjIcon`（03 §2）。
 *
 * 这层只做三件事：查图标、给尺寸、决定进不进无障碍树。
 * 旋转态刻意只挂类名——`animation` 写在样式表里才能被 `prefers-reduced-motion` 关掉；
 * 内联样式会绕开那条媒体查询，而持续旋转对前庭功能障碍用户是实际伤害。
 */

describe('OjIcon', () => {
  it('默认是装饰性的：aria-hidden，不占无障碍树', () => {
    const wrapper = mount(OjIcon, { props: { name: 'oj-close' } })
    expect(wrapper.classes()).toEqual(['oj-icon'])
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
    // 图标本体真的进来了，而不是一个空 span
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
  })

  it('给了 label 就变成 img，并带上名字', () => {
    const wrapper = mount(OjIcon, { props: { name: 'oj-close', label: '关闭' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('关闭')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    wrapper.unmount()
  })

  it('spin 只加一个类名，尺寸走 style', () => {
    const wrapper = mount(OjIcon, { props: { name: 'oj-close', spin: true, size: 20 } })
    expect(wrapper.classes()).toContain('oj-icon--spin')
    expect(wrapper.attributes('style')).toContain('width: 20px')
    expect(wrapper.attributes('style')).toContain('height: 20px')
    wrapper.unmount()

    // 字符串尺寸原样透出（给 em / calc() 留口子）
    const sized = mount(OjIcon, { props: { name: 'oj-close', size: '1.2em' } })
    expect(sized.attributes('style')).toContain('width: 1.2em')
    sized.unmount()
  })

  it('未知图标名不炸：渲染成空容器，dev 下另有告警', () => {
    const wrapper = mount(OjIcon, { props: { name: 'oj-does-not-exist', decorative: true } })
    expect(wrapper.element.innerHTML).toBe('')
    wrapper.unmount()
  })

  describe('运行时注册的业务图标', () => {
    afterEach(() => {
      resetRegisteredIcons()
    })

    it('注册后能直接渲染，走的是同一条 innerHTML 通道', () => {
      registerIcon(
        'acme-logo',
        '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6"/></svg>',
      )
      const wrapper = mount(OjIcon, { props: { name: 'acme-logo', label: '客户 logo' } })
      expect(wrapper.find('svg circle').exists()).toBe(true)
      expect(wrapper.attributes('aria-label')).toBe('客户 logo')
      wrapper.unmount()
    })
  })
})
