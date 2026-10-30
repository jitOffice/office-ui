import { computed, defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { useLocale } from './locale.ts'
import type { OjLocaleLike } from './locale.ts'

/**
 * `OjLocaleSwitcher`（04 §6.1、03 §6 M1「语言切换器」）。
 *
 * 用原生 `<select>` 而不是自绘下拉：它自带 IME、读屏的角色语义、移动端的原生选择器，
 * 自绘在这里换不到任何东西。样式只负责把它压到状态栏 / 工具条那一行的高度与配色。
 *
 * 受控与非受控的区别只在"谁去改运行时"：
 *   - 没给 `modelValue`：组件自己 `useLocale().use(name)`，一个字都不用配就能切语言；
 *   - 给了 `modelValue`：只发事件，由宿主决定何时 `i18n.use()`——宿主可能在切换前先存一次偏好设置。
 * 两种都发 `update:modelValue` 与 `change`（`change` 只由用户操作触发，03 §2）。
 */
export const OjLocaleSwitcher = defineComponent({
  name: 'OjLocaleSwitcher',
  props: {
    /** 显式语言表。不给就用 Provider 注册表里的（按 `name` 字典序，由运行时排好） */
    locales: { type: Array as PropType<readonly OjLocaleLike[] | undefined>, default: undefined },
    /** 受控值：当前语言 `name` */
    modelValue: { type: String as PropType<string | undefined>, default: undefined },
    /** 可访问名。不给则取 `oj.common.language`（切语言后跟着变） */
    label: { type: String as PropType<string | undefined>, default: undefined },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const locale = useLocale()
    const options = computed(() => props.locales ?? locale.list())
    const current = computed(() => props.modelValue ?? locale.lang.value)
    const name = computed(() => {
      // 读一次 lang：切语言后 aria-label 也要跟着换，否则读屏会念旧语言的"语言"
      void locale.lang.value
      return props.label ?? locale.t('oj.common.language', '语言')
    })

    function select(event: Event): void {
      const target = event.target as HTMLSelectElement
      const next = target.value
      emit('update:modelValue', next)
      emit('change', next)
      if (props.modelValue === undefined) {
        locale.use(next)
        return
      }
      // 受控：`<select>` 的值已经被用户改过了，而 Vue 只会把**变化了的** vnode value 写回 DOM。
      // 宿主若不采纳这个值（校验失败、异步保存、只读模式），下拉就会显示一份运行时并不认的语言——
      // 界面在撒谎。所以这里立刻拨回 prop，等宿主真的改了 prop 再让下一帧写回来。
      target.value = props.modelValue
    }

    return () => {
      const items = options.value
      // 一个语言都没有时渲染空下拉比不渲染更糟：它会抢焦点、念一段"无选项"
      if (items.length === 0) return null
      const value = current.value
      return h(
        'span',
        {
          class: 'oj-locale-switcher',
          'data-disabled': props.disabled ? '' : undefined,
        },
        [
          h(
            'select',
            {
              class: 'oj-locale-switcher__select',
              'aria-label': name.value,
              disabled: props.disabled || undefined,
              value,
              onChange: select,
            },
            items.map((item) =>
              h(
                'option',
                { value: item.name, selected: item.name === value },
                item.label ?? item.name,
              ),
            ),
          ),
        ],
      )
    }
  },
})
