import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

import { FONT_OPTIONS, filterFonts, stepFont } from '../shell/fonts.ts'
import type { FontOption } from '../shell/fonts.ts'

/**
 * `OjFontPicker`（03 §3 / M2）：字体列表 + 过滤 + 键盘。
 *
 * 每项用**自己的字体栈**渲染预览：字体选择器只显示名字等于让用户猜，
 * 尤其 `Serif` / `Sans` 这种词在中英混排下完全看不出差别。
 *
 * 过滤是纯子串匹配而不是模糊打分：字体列表通常只有几十项，
 * 打分排序会让"输入 sans 却排在第一的是 Doc Sans Mono"这类意外排到用户脸上。
 */
export const OjFontPicker = defineComponent({
  name: 'OjFontPicker',
  props: {
    modelValue: { type: String, required: true },
    fonts: { type: Array as PropType<readonly FontOption[]>, default: () => FONT_OPTIONS },
    label: { type: String, required: true },
    /** 搜索框的占位文案（语言相关，由使用方给）。 */
    placeholder: { type: String, default: '' },
    previewText: { type: String, default: 'Aa 字' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 过滤词必须是响应式的（要重渲染列表），但**不绑到 input 的 value**：
    // 绑了以后每次输入都会用旧值覆盖，光标跳到末尾
    const query = ref('')

    function move(key: string): void {
      const direction = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0
      if (direction === 0) return
      const next = stepFont(props.fonts, props.modelValue, direction)
      if (next === props.modelValue) return
      emit('update:modelValue', next)
    }

    return () => {
      const visible = filterFonts(props.fonts, query.value)
      return h(
        'div',
        {
          class: 'oj-font-picker',
          role: 'listbox',
          'aria-label': props.label,
          'data-disabled': props.disabled ? '' : undefined,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
            event.preventDefault()
            move(event.key)
          },
        },
        [
          h('input', {
            class: 'oj-font-picker__search',
            type: 'search',
            'aria-label': props.label,
            placeholder: props.placeholder,
            disabled: props.disabled,
            onInput: (event: Event) => {
              query.value = (event.target as HTMLInputElement).value
            },
          }),
          h(
            'ul',
            { class: 'oj-font-picker__list', role: 'presentation' },
            visible.map((font) =>
              h(
                'li',
                { key: font.id, role: 'presentation' },
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'oj-font-picker__option',
                    role: 'option',
                    'aria-selected': font.id === props.modelValue ? 'true' : 'false',
                    'data-active': font.id === props.modelValue ? '' : undefined,
                    style: { fontFamily: font.stack },
                    disabled: props.disabled,
                    onClick: () => emit('update:modelValue', font.id),
                  },
                  [h('span', { class: 'oj-font-picker__name' }, font.label), h('span', { class: 'oj-font-picker__preview' }, props.previewText)],
                ),
              ),
            ),
          ),
        ],
      )
    }
  },
})
