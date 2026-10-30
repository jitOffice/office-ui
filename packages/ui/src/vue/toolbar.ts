import { defineComponent, h } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import type { RibbonItemSpec, RibbonPackedItem } from '../ribbon.ts'
import { OjRibbonGroup } from './ribbon-group.ts'

export type ToolbarOverflow = 'menu' | 'scroll' | 'wrap'

export interface OjToolbarSlots {
  /** 一条命令；`item.display` 只对 `overflow: 'menu'` 有意义（其余模式不降级） */
  item?: (scope: { item: RibbonPackedItem }) => VNodeChild
  /** `»` 菜单里的条目，缺省沿用 `item` */
  overflow?: (scope: { item: RibbonPackedItem }) => VNodeChild
}

/**
 * `OjToolbar`（03 §3 B 组）：单行工具条，是 Ribbon 的简化形态（JitKnow、轻量编辑器用）。
 *
 * 三种溢出策略是**产品决策**，不是样式细节：
 *   - `menu`：宽度不够收进 `»`。位置稳定，盲操不会点错，代价是多一次点击；
 *   - `scroll`：横向滚动。适合命令多但用户不常横向滚的场景，代价是右侧命令**看不见**；
 *   - `wrap`：折行。命令全都可见，代价是吃掉两行高度、把正文往下推。
 * 默认 `menu`：办公场景里"按钮突然跑到第二行"比"多点一次"更让人措手不及。
 *
 * `menu` 直接复用 `OjRibbonGroup`——降级/溢出的预算逻辑只有一份，工具条不该有第二套。
 */
export const OjToolbar = defineComponent({
  name: 'OjToolbar',
  props: {
    items: { type: Array as PropType<readonly RibbonItemSpec[]>, required: true },
    overflow: { type: String as PropType<ToolbarOverflow>, default: 'menu' },
    available: { type: Number as PropType<number | undefined>, default: undefined },
    gap: { type: Number, default: 2 },
    overflowWidth: { type: Number, default: 20 },
    label: { type: String as PropType<string | undefined>, default: undefined },
    overflowLabel: { type: String, default: '更多' },
  },
  setup(props, { slots }) {
    return () => {
      if (props.overflow === 'menu') {
        return h(
          OjRibbonGroup,
          {
            items: props.items,
            available: props.available,
            gap: props.gap,
            overflowWidth: props.overflowWidth,
            label: props.label,
            overflowLabel: props.overflowLabel,
          },
          { item: slots.item, overflow: slots.overflow },
        )
      }

      return h(
        'div',
        {
          class: 'oj-toolbar',
          role: 'toolbar',
          'aria-label': props.label,
          'data-overflow': props.overflow,
        },
        props.items.map((item) =>
          h(
            'div',
            { class: 'oj-toolbar__item', 'data-item': item.id, 'data-size': item.size },
            slots.item?.({ item: { ...item, display: item.size } }) ?? h('span', null, item.id),
          ),
        ),
      )
    }
  },
})
