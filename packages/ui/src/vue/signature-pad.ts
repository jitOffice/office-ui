import { defineComponent, h, ref } from 'vue'

import { extendStroke, startStroke, strokePath } from '../shell/signature.ts'
import type { SignaturePoint, SignatureStroke } from '../shell/signature.ts'

export const OjSignaturePad = defineComponent({
  name: 'OjSignaturePad',
  props: {
    clearLabel: { type: String, required: true },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const strokes = ref<SignatureStroke[]>([])
    const drawing = ref(false)

    function point(event: PointerEvent): SignaturePoint {
      const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
      return { x: Math.round(event.clientX - bounds.left), y: Math.round(event.clientY - bounds.top) }
    }

    function publish(next: SignatureStroke[]): void {
      strokes.value = next
      emit('change', next)
    }

    return () =>
      h('div', { class: 'oj-signature' }, [
        h(
          'svg',
          {
            class: 'oj-signature__pad',
            viewBox: '0 0 360 140',
            onPointerdown: (event: PointerEvent) => {
              drawing.value = true
              ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
              publish(startStroke(strokes.value, point(event)))
            },
            onPointermove: (event: PointerEvent) => {
              if (!drawing.value) return
              publish(extendStroke(strokes.value, point(event)))
            },
            onPointerup: () => {
              drawing.value = false
            },
          },
          strokes.value.map((stroke, index) =>
            h('path', { key: index, d: strokePath(stroke), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6' }),
          ),
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'oj-button',
            'data-size': 'mini',
            onClick: () => publish([]),
          },
          props.clearLabel,
        ),
      ])
  },
})
