import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import { createI18n } from '../../../i18n/src/store.ts'
import enUS from '../../../i18n/src/locales/en-US.ts'
import jaJP from '../../../i18n/src/locales/ja-JP.ts'
import zhCN from '../../../i18n/src/locales/zh-CN.ts'
import zhTW from '../../../i18n/src/locales/zh-TW.ts'
import { OjLocaleProvider, OjLocaleSwitcher, useLocale } from '../../src/vue/index.ts'

/**
 * `OjLocaleProvider` / `useLocale` / `OjLocaleSwitcher`（03 §6 M1、04 §6.1）。
 *
 * 这里刻意用**真实的** `createI18n()` 与真实语言包，而不是手搓一个假运行时：
 * `ui` 不 import `@jitoffice/i18n`，Provider 靠结构类型收运行时——"结构真的对得上"
 * 这件事只有把真货传进去才算验过。顺带把 `oj.common.language` 这条 key 在四语里都存在钉死。
 */

const i18n = (): ReturnType<typeof createI18n> =>
  createI18n({
    locale: 'zh-CN',
    locales: [zhCN, zhTW, jaJP, enUS],
    dev: false,
  })

const Reader = defineComponent({
  name: 'Reader',
  setup() {
    const locale = useLocale()
    return () =>
      h('span', { class: 'reader', 'data-provided': locale.provided ? 'yes' : 'no' }, [
        locale.t('oj.common.language', '语言'),
        h('i', { class: 'reader-lang' }, locale.lang.value),
      ])
  },
})

const wrappers: { unmount(): void }[] = []

function track<T extends { unmount(): void }>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  const root = document.documentElement
  root.removeAttribute('lang')
  root.removeAttribute('dir')
})

describe('OjLocaleProvider', () => {
  it('把真实 i18n 运行时的文案、lang 与 html[lang] 一起接上', async () => {
    const runtime = i18n()
    const wrapper = track(
      mount(OjLocaleProvider, { props: { i18n: runtime }, slots: { default: () => h(Reader) } }),
    )
    await nextTick()

    expect(wrapper.find('.reader').attributes('data-provided')).toBe('yes')
    expect(wrapper.find('.reader').text()).toContain('语言')
    // tokens 的语言覆写层就是匹配 html[lang|="ja"]，所以这一步不是"锦上添花"
    expect(document.documentElement.lang).toBe('zh-CN')

    runtime.use('ja-JP')
    await nextTick()

    expect(wrapper.find('.reader').text()).toContain('言語')
    expect(wrapper.find('.reader-lang').text()).toBe('ja-JP')
    expect(document.documentElement.lang).toBe('ja-JP')
  })

  it('切语言后 direction 跟着写进 html[dir]', async () => {
    const runtime = i18n()
    const wrapper = track(mount(OjLocaleProvider, { props: { i18n: runtime }, slots: { default: () => h('b') } }))
    await nextTick()
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')

    runtime.register({ ...zhCN, name: 'ar', intl: 'ar', label: 'العربية', direction: 'rtl' })
    runtime.use('ar')
    await nextTick()

    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
    wrapper.unmount()
    wrappers.length = 0
  })

  it('卸载归还宿主的 lang / dir，而不是把它留在最后切换的语言上', async () => {
    document.documentElement.lang = 'en'
    document.documentElement.setAttribute('dir', 'ltr')

    const runtime = i18n()
    const wrapper = mount(OjLocaleProvider, { props: { i18n: runtime }, slots: { default: () => h('b') } })
    await nextTick()
    expect(document.documentElement.lang).toBe('zh-CN')

    wrapper.unmount()
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
  })

  it('宿主自己改过 lang 就不覆盖回去：接管权在宿主手里', async () => {
    document.documentElement.lang = 'en'
    const runtime = i18n()
    const wrapper = mount(OjLocaleProvider, { props: { i18n: runtime }, slots: { default: () => h('b') } })
    await nextTick()

    document.documentElement.lang = 'fr'
    wrapper.unmount()

    expect(document.documentElement.lang).toBe('fr')
  })

  it('syncDocument: false 时不碰 html，但文案照样切', async () => {
    document.documentElement.lang = 'en'
    const runtime = i18n()
    const wrapper = track(
      mount(OjLocaleProvider, {
        props: { i18n: runtime, syncDocument: false },
        slots: { default: () => h(Reader) },
      }),
    )
    await nextTick()
    expect(document.documentElement.lang).toBe('en')

    runtime.use('ja-JP')
    await nextTick()
    expect(wrapper.find('.reader').text()).toContain('言語')
    expect(document.documentElement.lang).toBe('en')
  })

  it('没有 Provider 时 t() 退回组件默认文案，use() 只告警不抛错', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let context: ReturnType<typeof useLocale> | undefined

    const Bare = defineComponent({
      setup() {
        context = useLocale()
        return () => h('b')
      },
    })
    mount(Bare)

    expect(context?.provided).toBe(false)
    expect(context?.t('oj.common.language', '语言')).toBe('语言')
    expect(context?.list()).toEqual([])
    expect(() => context?.use('ja-JP')).not.toThrow()
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })
})

describe('OjLocaleSwitcher', () => {
  it('非受控：选一项就切换运行时，选项用该语言自身的写法', async () => {
    const runtime = i18n()
    const wrapper = track(
      mount(OjLocaleProvider, {
        props: { i18n: runtime },
        slots: { default: () => h(OjLocaleSwitcher) },
      }),
    )
    await nextTick()

    const select = wrapper.find('select')
    expect(select.attributes('aria-label')).toBe('语言')
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
      'English',
      '日本語',
      '简体中文',
      '繁體中文',
    ])

    await select.setValue('ja-JP')
    await nextTick()

    expect(runtime.lang).toBe('ja-JP')
    expect(wrapper.findComponent(OjLocaleSwitcher).emitted('change')).toEqual([['ja-JP']])
    // 切语言后 aria-label 自己也要换，否则读屏会念旧语言的"语言"
    expect(wrapper.find('select').attributes('aria-label')).toBe('言語')
  })

  it('受控：只发事件，运行时由宿主自己改', async () => {
    const runtime = i18n()
    const Switcher = defineComponent({
      setup() {
        return () =>
          h(OjLocaleProvider, { i18n: runtime }, () =>
            h(OjLocaleSwitcher, {
              modelValue: 'zh-CN',
              'onUpdate:modelValue': (value: string) => events.push(value),
            }),
          )
      },
    })
    const events: string[] = []
    const wrapper = track(mount(Switcher))
    await nextTick()

    await wrapper.find('select').setValue('ja-JP')
    await nextTick()

    expect(events).toEqual(['ja-JP'])
    expect(runtime.lang).toBe('zh-CN')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('zh-CN')
  })

  it('v-model 正常路径：宿主接受新值后下拉跟着显示，不被"拨回 prop"弄坏', async () => {
    const runtime = i18n()
    const Host = defineComponent({
      setup() {
        const value = ref('zh-CN')
        return () =>
          h(OjLocaleProvider, { i18n: runtime }, () =>
            h(OjLocaleSwitcher, {
              modelValue: value.value,
              'onUpdate:modelValue': (next: string) => {
                value.value = next
              },
            }),
          )
      },
    })
    const wrapper = track(mount(Host))
    await nextTick()

    await wrapper.find('select').setValue('en-US')
    await nextTick()

    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('en-US')
    // 受控模式下运行时仍由宿主改：切了值不代表切了语言
    expect(runtime.lang).toBe('zh-CN')
  })

  it('一个语言都没注册时不渲染空下拉', () => {
    const wrapper = track(mount(OjLocaleSwitcher))
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('disabled 时下拉真的不可用', async () => {
    const runtime = i18n()
    const wrapper = track(
      mount(OjLocaleProvider, {
        props: { i18n: runtime },
        slots: { default: () => h(OjLocaleSwitcher, { disabled: true }) },
      }),
    )
    await nextTick()

    expect(wrapper.find('.oj-locale-switcher').attributes('data-disabled')).toBe('')
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })
})
