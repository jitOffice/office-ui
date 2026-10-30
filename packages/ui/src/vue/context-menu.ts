import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import { menuAction, menuNeighbor, menuSelectable } from '../menu.ts'
import type { OjMenuItem, OjMenuItemAction } from '../menu.ts'
import { OjPopper } from './popper.ts'
import { OjPortal } from './portal.ts'

/**
 * `OjContextMenu`（03 §3 B 组）。
 *
 * 关键差异在**没有 DOM 锚点**：文档里选中文字、表格里点了右键、canvas 上按了 `contextmenu`，
 * 锚点只是一个坐标。所以定位走 `OjPopper` 的 `anchorBox`（零尺寸矩形），
 * 不依赖任何元素，也就不需要"先找一个元素再量"的那套。
 *
 * 键盘模型（03 §5）：菜单一开就把焦点放到第一个可选项，上下键**环绕**、Home/End 跳首尾、
 * Enter/空格执行、Esc/Tab 关闭。焦点是真的落在 `<button role="menuitem">` 上（roving tabindex），
 * 不是靠 `aria-activedescendant`——后者在 Office 这种"菜单里还嵌选择器"的场景里更容易漏更新。
 *
 * 关闭时把焦点**还给打开前的位置**：canvas 场景下它可能只是 body（那就别抢），
 * 但在输入框上右键的菜单，关掉之后用户还得接着打字。
 */
export const OjContextMenu = defineComponent({
  name: 'OjContextMenu',
  props: {
    open: { type: Boolean, required: true },
    items: { type: Array as PropType<readonly OjMenuItem[]>, required: true },
    /** 视口坐标（`clientX` / `clientY` 直接给，不要减滚动量） */
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    /** `'body' | '#selector' | false`（03 §2「弹层归属」） */
    teleport: { type: [String, Boolean], default: 'body' },
    label: { type: String as PropType<string | undefined>, default: undefined },
  },
  emits: ['update:open', 'select', 'close'],
  setup(props, { emit }) {
    const list = ref<HTMLElement | null>(null)
    const active = ref(-1)
    let restoreTo: HTMLElement | null = null

    /** 零尺寸锚点：菜单左上角落在右键位置，越界由 `placePopper` 翻转/夹取。 */
    const anchorBox = computed(() => ({ x: props.x, y: props.y, width: 0, height: 0 }))

    function close(reason: 'select' | 'escape' | 'tab' | 'outside'): void {
      emit('update:open', false)
      emit('close', reason)
    }

    function focusIndex(index: number): void {
      active.value = index
      if (index < 0) return
      list.value?.querySelector<HTMLElement>(`[data-menu-index="${index}"]`)?.focus()
    }

    function move(key: string): boolean {
      const next = menuNeighbor(props.items, active.value, key)
      if (next === active.value) return false
      focusIndex(next)
      return true
    }

    function choose(item: OjMenuItemAction): void {
      emit('select', item.id)
      close('select')
    }

    function onPointerDown(event: PointerEvent): void {
      const el = list.value
      if (el !== null && event.target instanceof Node && el.contains(event.target)) return
      close('outside')
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        // 不 stopPropagation 的话，外层 `OjDialog` 会同时被关掉——一次 Esc 关两层
        event.stopPropagation()
        close('escape')
        return
      }
      if (event.key === 'Tab') {
        // 菜单不是模态面板，Tab 出去就等于放弃选择
        event.preventDefault()
        close('tab')
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const item = menuAction(props.items, active.value)
        if (item === undefined) return
        event.preventDefault()
        choose(item)
        return
      }
      if (move(event.key)) event.preventDefault()
    }

    function bindDocument(): void {
      if (typeof document === 'undefined') return
      document.addEventListener('pointerdown', onPointerDown, true)
    }

    function unbindDocument(): void {
      if (typeof document === 'undefined') return
      document.removeEventListener('pointerdown', onPointerDown, true)
    }

    function activate(): void {
      if (typeof document === 'undefined') return
      restoreTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
      bindDocument()
      // 等 `OjPopper` 把面板渲染出来再聚焦：第一帧里还没有可聚焦的节点
      void nextTick(() => focusIndex(menuNeighbor(props.items, -1, 'ArrowDown')))
    }

    function deactivate(): void {
      if (typeof document === 'undefined') return
      unbindDocument()
      active.value = -1
      // body 不算"原来的位置"：给它 focus 什么也不会发生，反而把焦点从宿主元素上抢走
      if (restoreTo !== null && restoreTo !== document.body && restoreTo.isConnected) restoreTo.focus()
      restoreTo = null
    }

    // 初次挂载就 `open: true` 是合法用法（`v-model` 的初始值），watch 不带 immediate 会漏掉它：
    // 结果是菜单画出来了、却没聚焦、也点不掉。
    onMounted(() => {
      if (props.open) activate()
    })
    watch(
      () => props.open,
      (open) => {
        if (open) activate()
        else deactivate()
      },
    )

    onUnmounted(unbindDocument)

    function renderItem(item: OjMenuItem, index: number): VNodeChild {
      if (item.kind === 'separator') {
        return h('div', { class: 'oj-context-menu__separator', role: 'separator' })
      }
      return h(
        'button',
        {
          type: 'button',
          class: 'oj-context-menu__item',
          role: 'menuitem',
          'data-menu-index': index,
          'data-danger': item.danger ? '' : undefined,
          'data-active': index === active.value ? '' : undefined,
          'aria-disabled': item.disabled ? 'true' : undefined,
          tabindex: '-1',
          disabled: item.disabled || undefined,
          onMouseenter: () => {
            if (menuSelectable(item)) active.value = index
          },
          onClick: () => {
            if (!menuSelectable(item)) return
            choose(item)
          },
        },
        [
          h('span', { class: 'oj-context-menu__label' }, item.label ?? item.id),
          item.shortcut === undefined
            ? null
            : h('kbd', { class: 'oj-context-menu__shortcut' }, item.shortcut),
        ],
      )
    }

    return () => {
      if (!props.open) return null
      const nodes: VNodeChild[] = []
      props.items.forEach((item, index) => {
        if (item.separatorBefore) nodes.push(h('div', { class: 'oj-context-menu__separator', role: 'separator' }))
        nodes.push(renderItem(item, index))
      })
      return h(OjPortal, { to: props.teleport, zIndex: 'var(--oj-z-dropdown)' }, () =>
        h(OjPopper, { open: props.open, anchorBox: anchorBox.value }, () =>
          h(
            'div',
            {
              ref: list,
              class: 'oj-context-menu',
              role: 'menu',
              'aria-label': props.label,
              tabindex: '-1',
              onKeydown,
            },
            nodes,
          ),
        ),
      )
    }
  },
})
