import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

export interface OjAiMessage {
  role: 'user' | 'assistant'
  text: string
}

export const OjAiPanel = defineComponent({
  name: 'OjAiPanel',
  props: {
    title: { type: String, required: true },
    placeholder: { type: String, required: true },
    sendLabel: { type: String, required: true },
    messages: { type: Array as PropType<readonly OjAiMessage[]>, default: () => [] },
    notice: { type: String, default: '' },
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const draft = ref('')
    return () =>
      h('aside', { class: 'oj-ai', 'aria-label': props.title }, [
        h('header', { class: 'oj-ai__title' }, props.title),
        props.notice ? h('p', { class: 'oj-ai__notice' }, props.notice) : null,
        h(
          'ol',
          { class: 'oj-ai__log' },
          props.messages.map((message, index) => h('li', { key: index, 'data-role': message.role }, message.text)),
        ),
        h('form', {
          class: 'oj-ai__form',
          onSubmit: (event: Event) => {
            event.preventDefault()
            const text = draft.value.trim()
            if (!text) return
            draft.value = ''
            emit('submit', text)
          },
        }, [
          h('input', {
            value: draft.value,
            placeholder: props.placeholder,
            onInput: (event: Event) => {
              draft.value = (event.target as HTMLInputElement).value
            },
          }),
          h('button', { type: 'submit', class: 'oj-button', 'data-size': 'mini' }, props.sendLabel),
        ]),
      ])
  },
})