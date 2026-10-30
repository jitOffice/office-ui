import assert from 'node:assert/strict'
import test from 'node:test'

import { createTriggerMachine } from '../src/index.ts'
import type { TriggerCloseReason, TriggerScheduler } from '../src/index.ts'

/**
 * 注入式 scheduler：把它做成"手动时钟"，每条时序都能断言到确切毫秒，
 * 不用 `setTimeout` 真等——等待型测试在 CI 上最不稳。
 */
function fakeClock() {
  let now = 0
  let seq = 0
  const tasks = new Map<number, { at: number; task: () => void }>()
  const scheduler: TriggerScheduler = {
    setTimeout: (task, ms) => {
      seq += 1
      tasks.set(seq, { at: now + ms, task })
      return seq
    },
    clearTimeout: (handle) => {
      tasks.delete(handle)
    },
  }
  return {
    scheduler,
    advance(ms: number): void {
      now += ms
      for (const [handle, entry] of [...tasks.entries()].sort((a, b) => a[1].at - b[1].at)) {
        if (entry.at > now) continue
        tasks.delete(handle)
        entry.task()
      }
    },
    pending: (): number => tasks.size,
  }
}

function machine(modes: string[], extra: { openDelay?: number; closeDelay?: number } = {}) {
  const clock = fakeClock()
  const events: string[] = []
  const reasons: TriggerCloseReason[] = []
  const m = createTriggerMachine({
    modes: modes as ('hover' | 'click' | 'focus' | 'manual')[],
    openDelay: extra.openDelay,
    closeDelay: extra.closeDelay,
    scheduler: clock.scheduler,
    onOpen: () => events.push('open'),
    onClose: (reason) => {
      events.push('close')
      reasons.push(reason)
    },
  })
  return { m, clock, events, reasons }
}

test('click：单击开、再单击关', () => {
  const { m, events } = machine(['click'])
  m.press()
  assert.deepEqual(events, ['open'])
  m.press()
  assert.deepEqual(events, ['open', 'close'])
})

test('hover：进入不立刻开，离开不立刻关 —— 面板要能移进去', () => {
  const { m, clock, events } = machine(['hover'], { openDelay: 80, closeDelay: 120 })

  m.enter()
  // 还没到延迟：不能开。否则鼠标扫过 Ribbon 就会一路弹面板。
  assert.deepEqual(events, [])
  clock.advance(79)
  assert.deepEqual(events, [])
  clock.advance(1)
  assert.deepEqual(events, ['open'])

  m.leave()
  // 离开触发器但closeDelay 未到：必须还开着，给指针留出跨过间隙的时间
  assert.deepEqual(events, ['open'])
  clock.advance(121)
  assert.deepEqual(events, ['open', 'close'])
})

test('hover：指针移进面板会取消待关闭', () => {
  const { m, clock, events } = machine(['hover'], { closeDelay: 120 })
  m.enter()
  m.leave()
  // 离开触发器后、超时前进入面板
  m.panelEnter()
  clock.advance(1000)
  // 没有取消的话，这里已经关掉了——下拉菜单永远够不到
  assert.deepEqual(events, ['open'])

  m.panelLeave()
  clock.advance(121)
  assert.deepEqual(events, ['open', 'close'])
})

test('hover 的 closeDelay 为 0 时立刻关：这是使用方显式选择的，不是默认值', () => {
  const { m, events } = machine(['hover'], { closeDelay: 0 })
  m.enter()
  m.leave()
  assert.deepEqual(events, ['open', 'close'])
})

test('focus：聚焦即开，失焦延迟关', () => {
  const { m, clock, events, reasons } = machine(['focus'], { closeDelay: 50 })
  m.focusIn()
  assert.deepEqual(events, ['open'])
  m.focusOut()
  assert.deepEqual(events, ['open'])
  clock.advance(51)
  assert.deepEqual(events, ['open', 'close'])
  assert.deepEqual(reasons, ['blur'])
})

test('mode 未启用时对应事件完全无效', () => {
  const { m, events } = machine(['click'])
  m.enter()
  m.focusIn()
  m.panelLeave()
  m.press()
  // 只有 press 生效
  assert.deepEqual(events, ['open'])
})

test('escape 会取消待关闭的定时器，不会 120ms 后又弹回来', () => {
  const { m, clock, events } = machine(['hover'], { closeDelay: 120 })
  m.enter()
  m.leave()
  m.escape()
  assert.deepEqual(events, ['open', 'close'])
  clock.advance(500)
  // 旧定时器若没被清掉，这里会多出一次 open→close 或者干脆重新弹出
  assert.deepEqual(events, ['open', 'close'])
  assert.equal(clock.pending(), 0)
})

test('sync：外部把面板关掉后，下一次 press 必须算"打开"', () => {
  const { m, events } = machine(['click'])
  m.press()
  assert.equal(m.isOpen(), true)
  // 模拟 v-model 被外部改回 false（比如点了面板里的某一项）
  m.sync(false)
  assert.equal(m.isOpen(), false)
  m.press()
  // 不同步的话这里会算成 close，用户得点两下才打开
  assert.deepEqual(events, ['open', 'open'])
})

test('重复 press 不会产生多余事件', () => {
  const { m, events } = machine(['click'])
  m.press()
  m.press()
  m.press()
  assert.deepEqual(events, ['open', 'close', 'open'])
})
