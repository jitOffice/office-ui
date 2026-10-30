import { defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'

import { placePopper } from '../popper.ts'
import type { Box, PopperPlacement } from '../popper.ts'

/** 元素 → 视口矩形。`anchorBox` 优先：canvas 右键坐标没有元素可量。 */
function anchorOf(el: HTMLElement | null, box: Pick<Box, 'x' | 'y' | 'width' | 'height'> | null): Box | null {
  if (box !== null) return { x: box.x, y: box.y, width: box.width, height: box.height }
  if (el === null) return null
  const rect = el.getBoundingClientRect()
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
}

export const OjPopper = defineComponent({
  name: 'OjPopper',
  props: {
    open: { type: Boolean, required: true },
    anchor: { type: Object as PropType<HTMLElement | null>, default: null },
    /**
     * 锚**矩形**（视口坐标），优先级高于 `anchor`。
     *
     * 03 §3 D 组点名的两种场景都落在这里：canvas 上的右键坐标（没有 DOM 目标，
     * 矩形退化成零尺寸点）与文本选区的包围盒（锚点是一片区域，不是一个元素）。
     */
    anchorBox: { type: Object as PropType<Pick<Box, 'x' | 'y' | 'width' | 'height'> | null>, default: null },
    placement: { type: String as PropType<PopperPlacement>, default: 'bottom-start' },
  },
  setup(props, { slots }) {
    const panel = ref<HTMLElement | null>(null)
    const x = ref(0)
    const y = ref(0)
    const placed = ref(false)

    function update(): void {
      const el = panel.value
      if (!props.open || !el) return
      const box = anchorOf(props.anchor, props.anchorBox)
      if (box === null) return
      const popup = el.getBoundingClientRect()
      const next = placePopper({
        anchor: box,
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
    // 锚矩形变了（用户在画布上又点了一次、选区跟着滚动移动）要重算，否则菜单会停在上一个坐标
    watch(
      () => [props.anchorBox?.x, props.anchorBox?.y, props.anchorBox?.width, props.anchorBox?.height],
      () => {
        if (props.open) void nextTick(update)
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
