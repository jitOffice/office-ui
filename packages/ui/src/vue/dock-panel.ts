import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

import { clampFloatRect, isFloating, redock, toggleCollapsed, undock } from '../shell/dock.ts'
import type { DockState, DockViewport, FloatRect } from '../shell/dock.ts'

/**
 * `OjDockPanel`（03 §3 D 组）：可停靠 / 浮动 / 收起的侧栏面板（属性面板、AI 任务面板）。
 *
 * 状态全在 `state` 里（受控）：组件只发 `update:state`，自己不记"停在哪、浮在哪"。
 * 理由很实际——面板位置要随会话保存、要跟着预设切换（合同审阅用右栏、写作用左栏），
 * 组件内部再存一份就一定会与宿主的真值分叉。
 *
 * 三条容易做错的：
 *   - **收起后标题栏必须还在**。整个面板隐藏掉，用户就再也找不到展开入口；
 *   - **浮动时按标题栏拖动，按钮不算拖动区**。不排除按钮，点"收起"会顺带把面板拖走几像素；
 *   - **位置夹取在拖动时就做**（`clampFloatRect`），不是松手后。松手才修正等于允许用户把面板
 *     拖出屏幕，然后眼睁睁看它跳回来。
 *
 * 停靠尺寸不归这里管：那是 `OjPaneGroup` 的栏位尺寸，由分隔条调。
 */
export const OjDockPanel = defineComponent({
  name: 'OjDockPanel',
  props: {
    state: { type: Object as PropType<DockState>, required: true },
    /** 面板标题，同时作为 region 的可访问名。 */
    title: { type: String, required: true },
    collapseLabel: { type: String, required: true },
    expandLabel: { type: String, required: true },
    /** 浮出按钮的可访问名（"浮动"）。 */
    floatLabel: { type: String, required: true },
    /** 停靠按钮的可访问名（"停靠"）。 */
    dockLabel: { type: String, required: true },
  },
  emits: ['update:state'],
  setup(props, { emit, slots }) {
    const dragging = ref(false)
    let originX = 0
    let originY = 0
    let originRect: FloatRect | undefined

    function viewport(): DockViewport {
      if (typeof window === 'undefined') return { width: 0, height: 0 }
      return { width: window.innerWidth, height: window.innerHeight }
    }

    function commit(next: DockState): void {
      if (next !== props.state) emit('update:state', next)
    }

    function capture(element: HTMLElement | null, pointerId: number): void {
      try {
        element?.setPointerCapture(pointerId)
      } catch {
        // 测试环境不一定实现指针捕获；失败只影响"拖出标题栏就断"
      }
    }

    function onPointerdown(event: PointerEvent): void {
      if (!isFloating(props.state) || event.button !== 0) return
      // 按钮在标题栏里：不排除的话点"收起"会顺带把面板拖走
      if ((event.target as Element | null)?.closest?.('button') !== null) return
      event.preventDefault()
      capture(event.currentTarget as HTMLElement | null, event.pointerId)
      dragging.value = true
      originX = event.clientX
      originY = event.clientY
      originRect = props.state.float
    }

    function onPointermove(event: PointerEvent): void {
      if (!dragging.value || originRect === undefined) return
      // 以按下时的矩形为基准：用 props 累积会让宿主的异步更新变成漂移
      const rect = clampFloatRect(
        {
          ...originRect,
          x: originRect.x + (event.clientX - originX),
          y: originRect.y + (event.clientY - originY),
        },
        viewport(),
      )
      if (rect.x === props.state.float.x && rect.y === props.state.float.y) return
      commit({ ...props.state, float: rect })
    }

    function finish(event: PointerEvent): void {
      if (!dragging.value) return
      dragging.value = false
      originRect = undefined
      const target = event.currentTarget as HTMLElement | null
      try {
        if (target?.hasPointerCapture(event.pointerId) === true) target.releasePointerCapture(event.pointerId)
      } catch {
        // 同上
      }
    }

    return () => {
      const state = props.state
      const floating = isFloating(state)

      return h(
        'section',
        {
          class: 'oj-dock',
          'data-side': state.side,
          'data-collapsed': state.collapsed ? '' : undefined,
          'data-dragging': dragging.value ? '' : undefined,
          'aria-label': props.title,
          style: floating
            ? {
                left: `${state.float.x}px`,
                top: `${state.float.y}px`,
                width: `${state.float.width}px`,
                // 收起时高度交给内容（只剩标题栏），写死高度会留一大块空白
                height: state.collapsed ? undefined : `${state.float.height}px`,
              }
            : undefined,
        },
        [
          h(
            'header',
            {
              class: 'oj-dock__header',
              onPointerdown,
              onPointermove,
              onPointerup: finish,
              onPointercancel: finish,
            },
            [
              h('h2', { class: 'oj-dock__title' }, props.title),
              h(
                'button',
                {
                  type: 'button',
                  class: 'oj-dock__collapse',
                  'aria-expanded': state.collapsed ? 'false' : 'true',
                  'aria-label': state.collapsed ? props.expandLabel : props.collapseLabel,
                  title: state.collapsed ? props.expandLabel : props.collapseLabel,
                  onClick: () => commit(toggleCollapsed(state)),
                },
                state.collapsed ? '▸' : '▾',
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'oj-dock__float',
                  'aria-pressed': floating ? 'true' : 'false',
                  'aria-label': floating ? props.dockLabel : props.floatLabel,
                  title: floating ? props.dockLabel : props.floatLabel,
                  onClick: () => commit(floating ? redock(state) : undock(state)),
                },
                floating ? '⇲' : '⇱',
              ),
            ],
          ),
          state.collapsed ? null : h('div', { class: 'oj-dock__body' }, slots.default?.()),
        ],
      )
    }
  },
})
