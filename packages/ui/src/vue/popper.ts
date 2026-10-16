import { defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'

import { placePopper } from '../popper.ts'
import type { PopperPlacement } from '../popper.ts'

export const OjPopper = defineComponent({
  name: 'OjPopper',
  props: {
    open: { type: Boolean, required: true },
    anchor: { type: Object as PropType<HTMLElement | null>, default: null },
    placement: { type: String as PropType<PopperPlacement>, default: 'bottom-start' },
  },
  setup(props, { slots }) {
    const panel = ref<HTMLElement | null>(null)
    const x = ref(0)
    const y = ref(0)
    const placed = ref(false)

    function update(): void {
      const anchor = props.anchor
      const el = panel.value
      if (!props.open || !anchor || !el) return
      const box = anchor.getBoundingClientRect()
      const popup = el.getBoundingClientRect()
      const next = placePopper({
        anchor: { x: box.left, y: box.top, width: box.width, height: box.height },
        popup: { width: popup.width, height: popup.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        placement: props.placement,
      })
      x.value = next.x
      y.value = next.y
      placed.value = true
    }

    onMounted(() => {
      void nextTick(update)
    })
    watch(
      () => props.open,
      (open) => {
        if (!open) placed.value = false
        else void nextTick(update)
      },
    )

    return () => {
      if (!props.open) return null
      return h(
        'div',
        {
          ref: panel,
          class: 'oj-popper',
          style: {
            left: `${x.value}px`,
            top: `${y.value}px`,
            visibility: placed.value ? 'visible' : 'hidden',
          },
        },
        slots.default?.(),
      )
    }
  },
})
