import { defineComponent, h, onUnmounted, ref, watch } from 'vue'
import type { PropType } from 'vue'

import { createTriggerMachine } from '../trigger.ts'
import type { TriggerMode } from '../trigger.ts'
import type { PopperPlacement } from '../popper.ts'
import { OjPopper } from './popper.ts'
import { OjPortal } from './portal.ts'

/**
 * 触发器 + 浮层（prd/03 §3 D 组）：`hover/click/focus/manual` 可组合，含离开延迟。
 *
 * 交互语义全在 `../trigger.ts` 的机器里（零依赖可测），这里只负责把 DOM 事件接上去、
 * 以及把面板放进 `OjPortal` + `OjPopper`。
 *
 * 受控与非受控都给：传 `open` 就是受控（配 `@update:open`），不传就内部自己管。
 * 03 §2 要求"所有可选面板组件同时支持 `v-model` 与 `defaultVisible`"——只给受控会把
 * "我想临时弹一下"这种最常见的用法写复杂。
 */
export const OjTrigger = defineComponent({
  name: 'OjTrigger',
  props: {
    open: { type: Boolean, default: undefined as unknown as boolean },
    modes: { type: [Array, String] as PropType<TriggerMode[] | TriggerMode>, default: () => ['click'] },
    placement: { type: String as PropType<PopperPlacement>, default: 'bottom-start' },
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 120 },
    /** 面板是否挂到 body（`false` 留在原地） */
    portal: { type: Boolean, default: true },
    /** 透传给 `OjPortal` 的挂载点 */
    teleport: { type: [String, Boolean], default: 'body' },
    lockScroll: { type: Boolean, default: false },
    trapFocus: { type: Boolean, default: false },
  },
  emits: ['update:open', 'open', 'close'],
  setup(props, { slots, emit }) {
    const anchor = ref<HTMLElement | null>(null)
    const inner = ref(false)
    const isControlled = (): boolean => props.open !== undefined
    const isOpen = (): boolean => (isControlled() ? props.open === true : inner.value)

    const machine = createTriggerMachine({
      modes: typeof props.modes === 'string' ? [props.modes] : props.modes,
      openDelay: props.openDelay,
      closeDelay: props.closeDelay,
      onOpen: () => {
        if (!isControlled()) inner.value = true
        emit('update:open', true)
        emit('open')
      },
      onClose: (reason) => {
        if (!isControlled()) inner.value = false
        emit('update:open', false)
        emit('close', reason)
      },
    })

    watch(
      () => props.open,
      (open) => {
        if (open !== undefined) machine.sync(open)
      },
      { immediate: true },
    )

    onUnmounted(() => machine.dispose())

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && isOpen()) {
        // 关闭必须走机器：它会取消待关闭的定时器，否则 120ms 后又弹回来
        machine.escape()
      }
    }

    return () => {
      const open = isOpen()
      return h(
        'span',
        {
          ref: anchor,
          class: 'oj-trigger',
          'data-open': open ? '' : undefined,
          onClick: () => machine.press(),
          onMouseenter: () => machine.enter(),
          onMouseleave: () => machine.leave(),
          onFocusin: () => machine.focusIn(),
          onFocusout: () => machine.focusOut(),
          onKeydown,
        },
        [
          slots.default?.(),
          open
            ? h(
                OjPortal,
                { to: props.portal ? props.teleport : false, lockScroll: props.lockScroll, trapFocus: props.trapFocus },
                () =>
                  h(
                    OjPopper,
                    { open, anchor: anchor.value, placement: props.placement },
                    () =>
                      h(
                        'div',
                        {
                          class: 'oj-trigger__panel',
                          role: 'dialog',
                          // 指针移进面板要取消"待关闭"，否则下拉永远移不进去
                          onMouseenter: () => machine.panelEnter(),
                          onMouseleave: () => machine.panelLeave(),
                          onKeydown,
                        },
                        slots.panel?.(),
                      ),
                  ),
              )
            : null,
        ],
      )
    }
  },
})
