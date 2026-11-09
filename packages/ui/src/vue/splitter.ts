import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

import { SPLITTER_STEP, clampPane, resizePane, stepPane, togglePane } from '../shell/splitter.ts'
import type { PaneBounds } from '../shell/splitter.ts'

/**
 * `OjSplitter`（03 §3 D 组）：两栏之间的可拖拽分隔条。
 *
 * 只画一根条子，不画两侧的栏——`size` 描述的是**被调那一栏**的宽度/高度，
 * 由 `pane` 决定是分隔条之前还是之后那一栏（默认 `'after'`，即右侧批注栏 / 下方控制台）。
 * 方向必须显式声明：同一根条子既能表示"左栏收起"也能表示"右栏展开"，
 * 两种语义都不说清等于永远搞不懂往哪拖。往右拖是**把右栏压窄、把左栏放宽**。
 *
 * 受控：拖拽只上抛 `update:size`，本地不留尺寸副本。拖拽期间宿主可能同时在钳制
 * （窗口缩小、另一栏被折叠），本地存一份就会出现松开后"跳一下"。
 *
 * 键盘走 WAI-ARIA window splitter 的语义：方向键移动的是**分隔条本身**，
 * 不是"把数值调大"——否则右栏的右键与左栏的右键行为相反，谁都用不对。
 */
export const OjSplitter = defineComponent({
  name: 'OjSplitter',
  props: {
    /** 被调那一栏的尺寸（px）。 */
    size: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    collapsible: { type: Boolean, default: false },
    /** 被调的是分隔条**之前**还是**之后**那一栏。 */
    pane: { type: String as PropType<'before' | 'after'>, default: 'after' },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    /** 分隔条的可访问名（"调整批注栏宽度"）。 */
    label: { type: String, required: true },
    step: { type: Number, default: SPLITTER_STEP },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:size', 'drag-start', 'drag-end'],
  setup(props, { emit }) {
    const dragging = ref(false)
    let origin = 0
    let originSize = 0
    // 以宿主当前值起步：否则键盘第一次"没有变化"的操作也会白抛一个事件
    let last = props.size

    function bounds(): PaneBounds {
      return { min: props.min, max: props.max, collapsible: props.collapsible }
    }

    /** 只在值真的变了才上抛：拖拽一次会收到几十个 pointermove，重复值会打断宿主的渲染合帧。 */
    function commit(next: number): void {
      if (next === last) return
      last = next
      emit('update:size', next)
    }

    /**
     * 指针捕获让光标划出条子之外仍能继续拖。测试环境（happy-dom）不一定实现，
     * 捕获失败只影响"拖出条子就断"，不该让拖拽本身抛错。
     */
    function capture(element: HTMLElement | null, pointerId: number): void {
      try {
        element?.setPointerCapture(pointerId)
      } catch {
        // 忽略：没有指针捕获也能拖，只是光标离开元素后事件会断
      }
    }

    function onPointerdown(event: PointerEvent): void {
      if (props.disabled || event.button !== 0) return
      event.preventDefault()
      capture(event.currentTarget as HTMLElement | null, event.pointerId)
      dragging.value = true
      origin = props.orientation === 'vertical' ? event.clientX : event.clientY
      originSize = props.size
      last = props.size
      emit('drag-start')
    }

    function onPointermove(event: PointerEvent): void {
      if (!dragging.value) return
      const pointer = props.orientation === 'vertical' ? event.clientX : event.clientY
      // 往右拖：调"之后"那一栏时它变窄（取反），调"之前"那一栏时它变宽
      const delta = props.pane === 'before' ? pointer - origin : origin - pointer
      // 起点固定用按下时的尺寸：用 props.size 累积会让宿主的异步更新变成漂移
      commit(resizePane(originSize, delta, bounds()))
    }

    function finish(event: PointerEvent): void {
      if (!dragging.value) return
      dragging.value = false
      const target = event.currentTarget as HTMLElement | null
      try {
        if (target?.hasPointerCapture(event.pointerId) === true) target.releasePointerCapture(event.pointerId)
      } catch {
        // 同上：捕获没建立成功时释放也会抛
      }
      emit('drag-end', last)
    }

    function onKeydown(event: KeyboardEvent): void {
      if (props.disabled) return
      const vertical = props.orientation === 'vertical'
      const backward = vertical ? 'ArrowLeft' : 'ArrowUp'
      const forward = vertical ? 'ArrowRight' : 'ArrowDown'
      // 条子往左/上移动时，"之后"那一栏变大、"之前"那一栏变小
      const grow = props.pane === 'before' ? forward : backward
      const shrink = props.pane === 'before' ? backward : forward

      if (event.key === grow) {
        event.preventDefault()
        commit(stepPane(props.size, 1, bounds(), props.step))
        return
      }
      if (event.key === shrink) {
        event.preventDefault()
        commit(stepPane(props.size, -1, bounds(), props.step))
        return
      }
      if (event.key === 'Home') {
        // 不可折叠时"最小"只能是 min：给 0 会让栏宽消失而回不来
        event.preventDefault()
        commit(props.collapsible ? 0 : clampPane(props.min, bounds()))
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        if (Number.isFinite(props.max)) commit(clampPane(props.max, bounds()))
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        commit(togglePane(props.size, bounds()))
      }
    }

    return () => {
      const collapsed = props.size === 0
      return h('div', {
        class: 'oj-splitter',
        role: 'separator',
        tabindex: props.disabled ? -1 : 0,
        'aria-label': props.label,
        'aria-orientation': props.orientation,
        'aria-valuenow': Math.round(props.size),
        'aria-valuemin': Math.round(props.min),
        'aria-valuemax': Number.isFinite(props.max) ? Math.round(props.max) : undefined,
        'aria-disabled': props.disabled ? 'true' : undefined,
        'data-orientation': props.orientation,
        'data-pane': props.pane,
        'data-dragging': dragging.value ? '' : undefined,
        'data-collapsed': collapsed ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined,
        onPointerdown,
        onPointermove,
        onPointerup: finish,
        onPointercancel: finish,
        onKeydown,
        // 双击切换折叠与 Word 侧栏一致；不可折叠时 togglePane 原样返回，不会变成 0
        onDblclick: () => {
          if (props.disabled) return
          commit(togglePane(props.size, bounds()))
        },
      })
    }
  },
})
