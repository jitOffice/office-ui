import { computed, defineComponent, h, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import { packRibbon, ribbonProbeSize, ribbonSmallerSize } from '../ribbon.ts'
import type {
  RibbonItemSize,
  RibbonItemSpec,
  RibbonPackItem,
  RibbonPackedItem,
  RibbonWidthTable,
} from '../ribbon.ts'
import { OjDropdown } from './dropdown.ts'

/**
 * `OjRibbonGroup`（03 §3 B 组）：组内命令按 large/medium/small 三档铺开，
 * 宽度不足先降级、再收进 `»`。
 *
 * 宽度从哪来：
 *   - 每项都给了 `width` / `widths` → 直接用，一次都不量（SSR、快照测试走这条）；
 *   - 没给 → **自己量**：先按设计尺寸渲染出来量第一档，还装不下就整组按 medium、
 *     再按 small 各探一版，量到就记表；最后交给 `packRibbon` 按真实宽度决定
 *     每一项降几档、哪些进 `»`。探测的那一版加了 `data-probe`，视觉上不可见，
 *     不会让用户看到"先挤一下再弹回来"。
 *
 * 可用宽度同理：宿主给 `available` 就直接用（编辑器已知面板宽、虚拟化列表）；
 * 不给就用 `ResizeObserver` 量自己。此时组必须是**被父级约束宽度**的
 * （`flex: 1 1 auto` / 固定宽 / grid 列），否则它的宽度由内容撑开，
 * 永远"装得下"，永远不降级——这是 ResizeObserver 做自适应最常见的一种假成功。
 */

export interface OjRibbonGroupSlots {
  /** 一条命令。`item.display` 是**降级之后**实际该用的尺寸。 */
  item?: (scope: { item: RibbonPackedItem }) => VNodeChild
  /** `»` 菜单里的同一条命令；缺省沿用 `item`。 */
  overflow?: (scope: { item: RibbonPackedItem }) => VNodeChild
  /** 组右下角的启动器（`OjCommandLauncher`）。缺省不渲染——不是每个组都有对话框 */
  launcher?: () => VNodeChild
}

export const OjRibbonGroup = defineComponent({
  name: 'OjRibbonGroup',
  props: {
    items: { type: Array as PropType<readonly RibbonItemSpec[]>, required: true },
    /** 可用宽度。给了就不观察 DOM，宿主自己掌握的那一路（SSR、虚拟化列表）走这里 */
    available: { type: Number as PropType<number | undefined>, default: undefined },
    /** 与 CSS 的 gap 同源：由组件写进 style，避免"预算按 2px、排版按 4px"那种错位 */
    gap: { type: Number, default: 2 },
    overflowWidth: { type: Number, default: 20 },
    label: { type: String as PropType<string | undefined>, default: undefined },
    overflowLabel: { type: String, default: '更多' },
  },
  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)
    const boxWidth = ref(0)
    const widths = ref<RibbonWidthTable>({})
    const probe = ref<RibbonItemSize | null>(null)
    const open = ref(false)
    /** 已经探过的档位：量不到（隐藏、零尺寸）时也不能无限重试 */
    const probed = new Set<RibbonItemSize>()
    let observer: ResizeObserver | undefined

    /** 有命令没给宽度时才需要自己量 */
    const auto = computed(() => props.items.some((item) => item.width === undefined))

    function observe(): void {
      observer?.disconnect()
      observer = undefined
      const el = root.value
      // 没有 ResizeObserver 的环境（SSR、老宿主）就停在 0 宽：宁可全部进 `»`，也不要瞎猜。
      if (props.available != null || !el || typeof ResizeObserver === 'undefined') return
      boxWidth.value = el.clientWidth
      observer = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (box) boxWidth.value = box.width
      })
      observer.observe(el)
    }

    onMounted(() => {
      observe()
      measure()
    })
    onUnmounted(() => observer?.disconnect())
    watch(() => props.available, observe)
    watch(
      () => props.items,
      () => {
        probed.clear()
        probe.value = null
      },
    )

    /** 把声明 + 已量到的宽度合成 `packRibbon` 要的形态。没量到的档位不虚构成小值。 */
    const packInput = computed<RibbonPackItem[]>(() =>
      props.items.map((item) => {
        const table = { ...(item.widths ?? {}), ...(widths.value[item.id] ?? {}) }
        return { id: item.id, size: item.size, width: item.width ?? table[item.size] ?? 0, widths: table }
      }),
    )

    const result = computed(() =>
      packRibbon(packInput.value, props.available ?? boxWidth.value, {
        gap: props.gap,
        overflowWidth: props.overflowWidth,
      }),
    )

    /**
     * 探测期间把**所有**命令按目标档渲染出来：如果这一版还按 `packRibbon` 的结果只渲染
     * 可见项，那么"宽度为 0 时全部溢出"的情况下根本没有节点可量，探测就成了死循环。
     */
    const layout = computed<{ visible: RibbonPackedItem[]; overflow: RibbonPackedItem[] }>(() => {
      const cap = probe.value
      if (cap === null) return { visible: result.value.visible, overflow: result.value.overflow }
      const all = [...result.value.visible, ...result.value.overflow].map((item) => ({
        ...item,
        display: ribbonSmallerSize(item.display, cap),
      }))
      return { visible: all, overflow: [] }
    })

    /** 量当前渲染出来的每一档宽度。返回是否有新数据。 */
    function measure(): boolean {
      const el = root.value
      if (!el || !auto.value) return false
      let changed = false
      for (const node of el.querySelectorAll<HTMLElement>('[data-item]')) {
        const id = node.dataset.item
        const size = node.dataset.size as RibbonItemSize | undefined
        if (id === undefined || size === undefined) continue
        const width = node.offsetWidth
        if (width <= 0) continue
        const known = widths.value[id]?.[size]
        if (known !== undefined && Math.abs(known - width) < 0.5) continue
        widths.value = {
          ...widths.value,
          [id]: { ...(widths.value[id] ?? {}), [size]: width },
        }
        changed = true
      }
      return changed
    }

    // 变宽后 `»` 会消失。菜单不能"记着开着"——否则下一次变窄，它会自己弹出来。
    watch(
      () => result.value.overflow.length === 0,
      (empty) => {
        if (empty) open.value = false
      },
    )

    onUpdated(() => {
      if (!auto.value) return
      measure()

      if (probe.value !== null) {
        // 探过一版就撤：无论量到没量到，都让 pack 用现有数据重新决定，避免卡在探测布局
        probed.add(probe.value)
        probe.value = null
        return
      }

      // 装得下就不再往下探：多探一档虽不可见，但没必要多渲染一次
      if (result.value.overflow.length === 0) return
      const next = ribbonProbeSize(props.items, widths.value)
      if (next !== undefined && !probed.has(next)) probe.value = next
    })

    function renderItem(item: RibbonPackedItem, where: 'group' | 'menu'): VNodeChild {
      const slot = (where === 'menu' ? slots.overflow ?? slots.item : slots.item) as OjRibbonGroupSlots['item']
      const body = slot?.({ item }) ?? h('span', { class: 'oj-ribbon-group__label' }, item.id)
      return h(
        'div',
        {
          class: where === 'menu' ? 'oj-ribbon-group__menu-item' : 'oj-ribbon-group__item',
          'data-item': item.id,
          'data-size': where === 'group' ? item.display : undefined,
          role: where === 'menu' ? 'menuitem' : undefined,
          tabindex: where === 'menu' ? '-1' : undefined,
        },
        [body],
      )
    }

    function renderOverflow(items: RibbonPackedItem[]): VNodeChild {
      return h(
        OjDropdown,
        {
          open: open.value,
          'onUpdate:open': (next: boolean) => {
            open.value = next
          },
        },
        {
          trigger: () =>
            h(
              'button',
              {
                type: 'button',
                class: 'oj-ribbon-group__overflow',
                style: { width: `${props.overflowWidth}px` },
                'aria-haspopup': 'menu',
                'aria-expanded': open.value ? 'true' : 'false',
                'aria-label': props.overflowLabel,
                title: props.overflowLabel,
              },
              '\u00BB',
            ),
          default: () =>
            h(
              'div',
              {
                class: 'oj-ribbon-group__menu',
                role: 'menu',
                'aria-label': props.overflowLabel,
                onClick: () => {
                  open.value = false
                },
              },
              items.map((item) => renderItem(item, 'menu')),
            ),
        },
      )
    }

    return () => {
      const packed = layout.value
      return h(
        'div',
        {
          ref: root,
          class: 'oj-ribbon-group',
          role: 'toolbar',
          'aria-label': props.label,
          'data-probe': probe.value !== null ? '' : undefined,
          style: { gap: `${props.gap}px` },
        },
        [
          ...packed.visible.map((item) => renderItem(item, 'group')),
          packed.overflow.length > 0 ? renderOverflow(packed.overflow) : null,
          slots.launcher === undefined
            ? null
            : h('span', { class: 'oj-ribbon-group__launcher' }, slots.launcher()),
        ],
      )
    }
  },
})
