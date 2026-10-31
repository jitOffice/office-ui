import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { clampNumber } from '../shell/number-field.ts'
import type { NumberBounds } from '../shell/number-field.ts'
import {
  LINE_SPACING_PRESETS,
  LINE_SPACING_RANGE,
  formatLineSpacing,
  nearestPreset,
  stepPreset,
} from '../shell/presets.ts'

/**
 * `OjLineSpacingPicker`（03 §3 / M2）：行距档位列表。
 *
 * 行距存的是**倍数**（1 / 1.15 / 1.5 / 2），不是 px：Word/WPS 的"多倍行距"就是这个语义，
 * 存 px 会在换字号时失真（14px 文字配 21px 行高，换成 32px 就挤成一团）。
 *
 * 选中态用 `aria-selected` 而不是只加 class：`role="listbox"` 里读屏靠它播报"当前第几项"。
 */
export const OjLineSpacingPicker = defineComponent({
  name: 'OjLineSpacingPicker',
  props: {
    modelValue: { type: Number, required: true },
    presets: { type: Array as PropType<readonly number[]>, default: () => LINE_SPACING_PRESETS },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 行距是小数（1.15 / 1.5）：精度必须写死两位，否则默认的整数取整会把 1.5 变成 2，
    // 表现为"选中行距 1.5，但高亮落在 2 上"
    const bounds = (): NumberBounds => ({ ...LINE_SPACING_RANGE, precision: 2 })
    const current = (): number => clampNumber(props.modelValue, bounds())

    function select(value: number): void {
      const next = clampNumber(value, bounds())
      // 点在已选中的档位上不重复发事件（受控组件会多一次无意义写入）
      if (next === current()) return
      emit('update:modelValue', next)
    }

    return () =>
      h(
        'div',
        {
          class: 'oj-line-spacing',
          role: 'listbox',
          'aria-label': props.label,
          'data-disabled': props.disabled ? '' : undefined,
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
            event.preventDefault()
            // 列表是纵向的：上 = 更大行距（与视觉顺序一致，不是数值顺序）
            select(stepPreset(props.presets, current(), event.key === 'ArrowUp' ? 1 : -1))
          },
        },
        [...props.presets].sort((a, b) => a - b).map((preset) =>
          h(
            'button',
            {
              type: 'button',
              class: 'oj-line-spacing__option',
              role: 'option',
              'aria-selected': preset === nearestPreset(props.presets, current()) ? 'true' : 'false',
              'data-active': preset === nearestPreset(props.presets, current()) ? '' : undefined,
              disabled: props.disabled,
              onClick: () => select(preset),
            },
            [
              h('span', { class: 'oj-line-spacing__lines', 'aria-hidden': 'true', style: { gap: `${Math.max(2, (preset - 1) * 6 + 2)}px` } }, [
                h('i', { class: 'oj-line-spacing__line' }),
                h('i', { class: 'oj-line-spacing__line' }),
              ]),
              h('span', { class: 'oj-line-spacing__value' }, formatLineSpacing(preset)),
            ],
          ),
        ),
      )
  },
})
