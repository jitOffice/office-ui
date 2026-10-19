import { defineComponent, h } from 'vue'

export const OjWatermark = defineComponent({
  name: 'OjWatermark',
  props: {
    text: { type: String, required: true },
    visible: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'oj-watermark' }, [
        slots.default?.(),
        props.visible ? h('div', { class: 'oj-watermark__layer', 'aria-hidden': 'true' }, props.text) : null,
      ])
  },
})
