/** Tooltip 延迟状态机。Office 默认 400ms：时间未到就离开，则不打开。 */

export interface TooltipMachine {
  readonly open: boolean
  enter(): void
  leave(): void
  show(): void
  hide(): void
  dispose(): void
}

export interface TooltipOptions {
  delay?: number
  /** 返回取消函数。测试注入同步调度器。 */
  schedule?: (fn: () => void, ms: number) => () => void
  onChange?: (open: boolean) => void
}

function defaultSchedule(fn: () => void, ms: number): () => void {
  const id = setTimeout(fn, ms)
  return () => clearTimeout(id)
}

export function createTooltipMachine(options: TooltipOptions = {}): TooltipMachine {
  const delay = options.delay ?? 400
  const schedule = options.schedule ?? defaultSchedule
  let open = false
  let pending: (() => void) | null = null

  function setOpen(next: boolean): void {
    if (open === next) return
    open = next
    options.onChange?.(open)
  }

  function cancel(): void {
    pending?.()
    pending = null
  }

  return {
    get open() {
      return open
    },
    enter() {
      if (open || pending) return
      pending = schedule(() => {
        pending = null
        setOpen(true)
      }, delay)
    },
    leave() {
      cancel()
      setOpen(false)
    },
    show() {
      cancel()
      setOpen(true)
    },
    hide() {
      cancel()
      setOpen(false)
    },
    dispose() {
      cancel()
    },
  }
}
