import { defineComponent, h } from 'vue'

export const OjStamp = defineComponent({
  name: 'OjStamp',
  props: {
    text: { type: String, required: true },
  },
  setup(props) {
    return () => h('span', { class: 'oj-stamp', 'aria-hidden': 'true' }, props.text)
  },
})
