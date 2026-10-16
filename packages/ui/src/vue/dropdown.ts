import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue'

import { OjPopper } from './popper.ts'

export const OjDropdown = defineComponent({
  name: 'OjDropdown',
  props: {
    open: { type: Boolean, default: false },
  },
  emits: ['update:open'],
  setup(props, { slots, emit }) {
    const root = ref<HTMLElement | null>(null)
    const anchor = ref<HTMLElement | null>(null)

    function setOpen(next: boolean): void {
      emit('update:open', next)
    }

    function onPointerDown(event: PointerEvent): void {
      const el = root.value
      if (!props.open || !el) return
      if (event.target instanceof Node && el.contains(event.target)) return
      setOpen(false)
    }

    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape' && props.open) {
        event.stopPropagation()
        setOpen(false)
        anchor.value?.focus()
      }
    }

    onMounted(() => {
      document.addEventListener('pointerdown', onPointerDown)
    })
    onUnmounted(() => {
      document.removeEventListener('pointerdown', onPointerDown)
    })

    return () =>
      h(
        'div',
        { ref: root, class: 'oj-dropdown', onKeydown: onKey },
        [
          h(
            'span',
            {
              ref: anchor,
              class: 'oj-dropdown__trigger',
              onClick: () => setOpen(!props.open),
            },
            slots.trigger?.(),
          ),
          h(OjPopper, { open: props.open, anchor: anchor.value }, { default: () => slots.default?.() }),
        ],
      )
  },
})
