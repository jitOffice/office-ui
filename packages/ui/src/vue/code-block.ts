import { defineComponent, h } from 'vue'

export const OjCodeBlock = defineComponent({
  name: 'OjCodeBlock',
  props: {
    code: { type: String, required: true },
    language: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('pre', { class: 'oj-code' }, [
        props.language ? h('span', { class: 'oj-code__lang' }, props.language) : null,
        props.code,
      ])
  },
})