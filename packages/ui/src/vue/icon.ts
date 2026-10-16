import { defineComponent, h } from 'vue'

import { iconMarkup } from '../icons.ts'

function cssSize(size: number | string): string {
  return typeof size === 'number' ? `${size}px` : size
}

export const OjIcon = defineComponent({
  name: 'OjIcon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: undefined },
    label: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const markup = iconMarkup(props.name)
      const labelled = typeof props.label === 'string' && props.label.length > 0
      return h('span', {
        class: 'oj-icon',
        role: labelled ? 'img' : undefined,
        'aria-label': labelled ? props.label : undefined,
        'aria-hidden': labelled ? undefined : 'true',
        style: props.size === undefined ? undefined : { width: cssSize(props.size), height: cssSize(props.size) },
        innerHTML: markup ?? '',
      })
    }
  },
})
