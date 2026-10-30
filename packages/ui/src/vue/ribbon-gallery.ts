import { defineComponent, h, ref, watch } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import { galleryNeighbor } from '../shell/gallery.ts'
import { OjIcon } from './icon.ts'

export interface OjRibbonGalleryItem {
  id: string
  label: string
  icon?: string
  disabled?: boolean
  active?: boolean
}

export interface OjRibbonGallerySlots {
  /** 自定义一格的内容，缺省是「图标 + 文字」 */
  item?: (scope: { item: OjRibbonGalleryItem; index: number }) => VNodeChild
}

/**
 * `OjRibbonGallery`（03 §3 B 组 🟡）：命令的网格陈列（样式库、符号）。
 *
 * 网格的键盘模型和普通列表不一样：上下要按**整行**跳、左右按格跳，且最后一行不满
 * 也不能走出边界。这段规则放在 `galleryNeighbor`（零依赖、有单测），组件只负责
 * roving tabindex 与把焦点真的挪过去。
 */
export const OjRibbonGallery = defineComponent({
  name: 'OjRibbonGallery',
  props: {
    items: { type: Array as PropType<readonly OjRibbonGalleryItem[]>, required: true },
    columns: { type: Number, default: 4 },
    label: { type: String as PropType<string | undefined>, default: undefined },
  },
  emits: ['select'],
  setup(props, { slots, emit }) {
    const root = ref<HTMLElement | null>(null)
    const focused = ref(0)

    // 换一批命令后下标可能越界，别让 roving tabindex 指到不存在的格子
    watch(
      () => props.items.length,
      (length) => {
        if (focused.value > length - 1) focused.value = Math.max(0, length - 1)
      },
    )

    function cells(): HTMLElement[] {
      return [...(root.value?.querySelectorAll<HTMLElement>('[data-gallery-item]') ?? [])]
    }

    function focusItem(index: number): void {
      cells()[index]?.focus()
    }

    /**
     * 从 `from` 出发沿 `direction` 找第一个能聚焦的格子。
     * 禁用的 `<button>` 收不到焦点——直接 `focus()` 会静默失败，焦点留在原地，
     * 用户按了方向键却什么都没发生。
     */
    function nearestEnabled(from: number, direction: 1 | -1): number | undefined {
      const nodes = cells()
      for (let i = from; i >= 0 && i < nodes.length; i += direction) {
        if (!(nodes[i] as HTMLButtonElement).disabled) return i
      }
      return undefined
    }

    function onKeydown(event: KeyboardEvent): void {
      const target = galleryNeighbor(props.columns, props.items.length, focused.value, event.key)
      if (target === focused.value) return
      event.preventDefault()

      const direction: 1 | -1 = target > focused.value ? 1 : -1
      let index = nearestEnabled(target, direction)
      if (index === undefined) index = nearestEnabled(target, direction === 1 ? -1 : 1)
      if (index === undefined) return

      focused.value = index
      focusItem(index)
    }

    return () => {
      const columns = Number.isFinite(props.columns) && props.columns >= 1 ? Math.floor(props.columns) : 1
      return h(
        'div',
        {
          ref: root,
          class: 'oj-ribbon-gallery',
          role: 'group',
          'aria-label': props.label,
          style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
          onKeydown,
        },
        props.items.map((item, index) =>
          h(
            'button',
            {
              type: 'button',
              class: 'oj-ribbon-gallery__item',
              'data-gallery-item': '',
              'data-item': item.id,
              'data-active': item.active ? '' : undefined,
              disabled: item.disabled || undefined,
              tabindex: index === focused.value ? 0 : -1,
              onClick: () => {
                if (item.disabled) return
                focused.value = index
                emit('select', item.id)
              },
            },
            slots.item?.({ item, index }) ?? [
              item.icon ? h(OjIcon, { name: item.icon, decorative: true }) : null,
              h('span', { class: 'oj-ribbon-gallery__label' }, item.label),
            ],
          ),
        ),
      )
    }
  },
})
