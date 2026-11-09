import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { PropType } from 'vue'

import {
  anchorAt,
  clampScrollOffset,
  createMetrics,
  measureItem,
  scrollTopForAnchor,
  visibleRange,
} from '../shell/virtual.ts'
import type { VirtualItem } from '../shell/virtual.ts'

/** 默认插槽拿到的行上下文。`measure` 要在行挂载与尺寸变化时调用，否则高度永远停在估算值。 */
export interface OjVirtualRow {
  readonly item: VirtualItem
  readonly index: number
  readonly measure: (height: number) => void
}

/**
 * `OjVirtualList`（03 §3 D 组）：变高虚拟列表，带 `scrollToIndex` 与锚点稳定。
 *
 * 只渲染 `visibleRange()` 给出的窗口，其余高度由 spacer 撑着。三条不变量：
 *   - **向上插入不跳**：数据更新前记下"视口顶部那一行 + 偏移"，更新后还原；锚点行被删掉时
 *     保持当前滚动位置（猜一个位置只会让用户从头找）。
 *   - **测量只改被量那一行之后的偏移**，前面的行纹丝不动，所以测量期不会抖。
 *   - **视口高度优先用 `viewportSize`**，没给才量容器（`ResizeObserver`）。放在首帧被折叠的
 *     侧栏里时容器高度是 0，只看容器会让列表永远不渲染、尺寸也永远补不上。
 *
 * 组件不猜行高：行内容通过默认插槽渲染，由宿主在挂载/变化时调用 `measure(height)`；
 * 想完全托管高度也可以直接把 `size` 写进 `items`。
 */
export const OjVirtualList = defineComponent({
  name: 'OjVirtualList',
  props: {
    items: { type: Array as PropType<readonly VirtualItem[]>, required: true },
    /** 未测量行的估算高度（px）。估得越准，首次滚动时的跳动越小。 */
    estimateSize: { type: Number, required: true },
    /** 视口上下各多渲染的行数：滚动时先看到白块再蹦出内容，多半就是少了这一圈。 */
    overscan: { type: Number, default: 3 },
    /** 视口高度（px）。传 0 表示由容器实际高度决定。 */
    viewportSize: { type: Number, default: 0 },
    /** 滚动区域的可访问名（"批注列表"）。 */
    label: { type: String, required: true },
  },
  setup(props, { slots, expose }) {
    const scroller = ref<HTMLElement | null>(null)
    const scrolled = ref(0)
    const containerHeight = ref(0)
    /** 宿主量到的高度按 id 存：行被回收后再滚回来不必重量一次。 */
    const measured = new Map<string, number>()

    const metrics = shallowRef(createMetrics(props.items, props.estimateSize))

    const viewport = computed(() => (props.viewportSize > 0 ? props.viewportSize : containerHeight.value))
    const viewportWindow = computed(() =>
      visibleRange(metrics.value, scrolled.value, viewport.value, props.overscan),
    )

    let observer: ResizeObserver | undefined

    function applyScroll(offset: number): void {
      const element = scroller.value
      if (element !== null) element.scrollTop = offset
    }

    function scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): void {
      const current = metrics.value
      if (current.ids.length === 0) return
      const target = Math.min(Math.max(Math.floor(index), 0), current.ids.length - 1)
      const rowOffset = current.offsets[target] as number
      const rowSize = current.sizes[target] as number
      const view = viewport.value
      const wanted =
        align === 'end'
          ? rowOffset + rowSize - view
          : align === 'center'
            ? rowOffset + rowSize / 2 - view / 2
            : rowOffset
      const next = clampScrollOffset(wanted, current, view)
      scrolled.value = next
      void nextTick(() => applyScroll(next))
    }

    function measure(index: number, height: number): void {
      const item = props.items[index]
      if (item === undefined) return
      measured.set(item.id, height)
      const next = measureItem(metrics.value, index, height)
      if (next !== metrics.value) metrics.value = next
    }

    // 数据更新：先还原锚点，再按新表重算偏移。
    // flush: 'pre' 保证在渲染前拿到新表，滚动位置与内容同帧生效，不会先闪一下再跳。
    watch(
      () => props.items,
      (next) => {
        const anchor = anchorAt(metrics.value, scrolled.value)
        metrics.value = createMetrics(
          // `size?: number` 在 exactOptionalPropertyTypes 下不能显式传 undefined
          next.map((item) => {
            const size = measured.get(item.id) ?? item.size
            return size === undefined ? { id: item.id } : { id: item.id, size }
          }),
          props.estimateSize,
        )
        const restored = anchor === undefined ? undefined : scrollTopForAnchor(metrics.value, anchor)
        const offset = clampScrollOffset(restored ?? scrolled.value, metrics.value, viewport.value)
        scrolled.value = offset
        void nextTick(() => applyScroll(offset))
      },
      { flush: 'pre' },
    )

    onMounted(() => {
      const element = scroller.value
      if (element === null) return
      containerHeight.value = element.clientHeight
      if (typeof ResizeObserver !== 'function') return
      observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect
        if (rect !== undefined) containerHeight.value = rect.height
      })
      observer.observe(element)
    })

    onBeforeUnmount(() => {
      observer?.disconnect()
      observer = undefined
    })

    expose({ scrollToIndex })

    return () => {
      const current = metrics.value
      const window = viewportWindow.value
      const rows = props.items.slice(window.start, window.end).map((item, offset) => {
        const index = window.start + offset
        return slots.default?.({
          item,
          index,
          measure: (height: number) => measure(index, height),
        } satisfies OjVirtualRow)
      })

      return h(
        'div',
        {
          class: 'oj-virtual-list',
          ref: scroller,
          role: 'list',
          'aria-label': props.label,
          tabindex: 0,
          onScroll: (event: Event) => {
            scrolled.value = (event.currentTarget as HTMLElement).scrollTop
          },
        },
        [
          h(
            'div',
            { class: 'oj-virtual-list__spacer', style: { height: `${current.total}px` } },
            [
              h(
                'div',
                {
                  class: 'oj-virtual-list__window',
                  style: { transform: `translateY(${window.padTop}px)` },
                },
                rows,
              ),
            ],
          ),
        ],
      )
    }
  },
})
