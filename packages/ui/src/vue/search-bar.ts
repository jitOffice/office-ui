import { defineComponent, h } from 'vue'

export const OjSearchReplaceBar = defineComponent({
  name: 'OjSearchReplaceBar',
  props: {
    find: { type: String, default: '' },
    replace: { type: String, default: '' },
    matchCase: { type: Boolean, default: false },
    current: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    findLabel: { type: String, required: true },
    replaceLabel: { type: String, required: true },
    nextLabel: { type: String, required: true },
    previousLabel: { type: String, required: true },
    matchCaseLabel: { type: String, required: true },
    countLabel: { type: String, required: true },
    replaceActionLabel: { type: String, required: true },
    replaceAllLabel: { type: String, required: true },
  },
  emits: ['update:find', 'update:replace', 'update:matchCase', 'next', 'previous', 'replace', 'replace-all'],
  setup(props, { emit }) {
    return () =>
      h('form', { class: 'oj-search', onSubmit: (event: Event) => event.preventDefault() }, [
        h('label', { class: 'oj-search__field' }, [
          h('span', props.findLabel),
          h('input', {
            value: props.find,
            onInput: (event: Event) => emit('update:find', (event.target as HTMLInputElement).value),
          }),
        ]),
        h('label', { class: 'oj-search__field' }, [
          h('span', props.replaceLabel),
          h('input', {
            value: props.replace,
            onInput: (event: Event) => emit('update:replace', (event.target as HTMLInputElement).value),
          }),
        ]),
        h('span', { class: 'oj-search__count' }, props.countLabel),
        h(
          'button',
          {
            type: 'button',
            class: 'oj-button',
            'data-size': 'mini',
            'data-active': props.matchCase ? '' : undefined,
            'aria-pressed': props.matchCase ? 'true' : 'false',
            onClick: () => emit('update:matchCase', !props.matchCase),
          },
          props.matchCaseLabel,
        ),
        h('button', { type: 'button', class: 'oj-button', 'data-size': 'mini', onClick: () => emit('previous') }, props.previousLabel),
        h('button', { type: 'button', class: 'oj-button', 'data-size': 'mini', onClick: () => emit('next') }, props.nextLabel),
        h('button', { type: 'button', class: 'oj-button', 'data-size': 'mini', onClick: () => emit('replace') }, props.replaceActionLabel),
        h('button', { type: 'button', class: 'oj-button', 'data-size': 'mini', onClick: () => emit('replace-all') }, props.replaceAllLabel),
      ])
  },
})
