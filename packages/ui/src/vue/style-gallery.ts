import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { galleryNeighbor } from '../shell/gallery.ts'
import { STYLE_PRESETS, styleLabel, stylePresetCss } from '../shell/style-gallery.ts'
import type { StylePreset } from '../shell/style-gallery.ts'

/**
 * `OjStyleGallery`（03 §3 / M2）：段落样式画廊。
 *
 * 每一项都用**预设自己的排版**渲染示例文本：只显示"标题 1/2/3"等于让用户背编号，
 * 而样式画廊的价值恰恰是"一眼看出层级"。
 *
 * 示例文本由 `sample` 给（语言相关：日文界面应该看到かな，而不是 "Aa"）。
 */
export const OjStyleGallery = defineComponent({
  name: 'OjStyleGallery',
  props: {
    modelValue: { type: String, required: true },
    presets: { type: Array as PropType<readonly StylePreset[]>, default: () => STYLE_PRESETS },
    label: { type: String, required: true },
    labels: { type: Object as PropType<Readonly<Record<string, string>>>, default: () => ({}) },
    sample: { type: String, default: 'Aa' },
    columns: { type: Number, default: 3 },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const columns = (): number =>
      Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1

    return () =>
      h(
        'div',
        {
          class: 'oj-style-gallery',
          role: 'listbox',
          'aria-label': props.label,
          'data-disabled': props.disabled ? '' : undefined,
          style: { gridTemplateColumns: `repeat(${columns()}, minmax(0, 1fr))` },
          onKeydown: (event: KeyboardEvent) => {
            const index = props.presets.findIndex((preset) => preset.id === props.modelValue)
            if (index === -1) return
            const next = galleryNeighbor(columns(), props.presets.length, index, event.key)
            if (next === index) return
            event.preventDefault()
            const preset = props.presets[next]
            if (preset !== undefined) emit('update:modelValue', preset.id)
          },
        },
        props.presets.map((preset) =>
          h(
            'button',
            {
              key: preset.id,
              type: 'button',
              class: 'oj-style-gallery__item',
              role: 'option',
              'aria-selected': preset.id === props.modelValue ? 'true' : 'false',
              'data-active': preset.id === props.modelValue ? '' : undefined,
              disabled: props.disabled,
              onClick: () => {
                if (preset.id === props.modelValue) return
                emit('update:modelValue', preset.id)
              },
            },
            [
              h('span', { class: 'oj-style-gallery__sample', 'aria-hidden': 'true', style: stylePresetCss(preset) }, props.sample),
              h('span', { class: 'oj-style-gallery__label' }, styleLabel(props.labels, preset.id)),
            ],
          ),
        ),
      )
  },
})
