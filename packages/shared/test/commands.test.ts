/**
 * D1 命令注册表验收。
 *
 * prd/05 §轨道 D 把四条列为"真实事故来源"，本文件逐条对应：
 * 记忆化与合帧、run 抛错不污染状态、重复注册行为、history 分档。
 * 其余用例守住的是同一层的边界：when 过滤、disabled 必须现算、脏检查不漏通知。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { createCommandRegistry } from '../src/commands/index.ts'
import type { OjCommand, OjCommandRegistry, OjHistoryAdapter, OjReactiveSource } from '../src/commands/index.ts'

interface Editor {
  editable: boolean
  bold: boolean
  partialBold: boolean
}

/** 手动泵：测试要能在确定的时刻观察"一帧之后"的状态。 */
function createPump(): { schedule: (task: () => void) => void; flush: () => void; pending: () => number } {
  const queue: (() => void)[] = []
  return {
    schedule: (task) => {
      queue.push(task)
    },
    flush: () => {
      for (const task of queue.splice(0, queue.length)) task()
    },
    pending: () => queue.length,
  }
}

function createStore(): OjReactiveSource & { notify: () => void; listeners: number } {
  const subs = new Set<() => void>()
  return {
    subscribe: (listener) => {
      subs.add(listener)
      return () => subs.delete(listener)
    },
    notify: () => {
      for (const fn of [...subs]) fn()
    },
    get listeners() {
      return subs.size
    },
  }
}

function boldCommand(counter?: { calls: number }): OjCommand<Editor> {
  return {
    id: 'format.bold',
    label: '加粗',
    icon: 'oj-format-bold',
    keys: 'mod+b',
    group: '开始',
    state: (ctx) => {
      if (counter) counter.calls += 1
      return { enabled: ctx.editable, active: ctx.bold, indeterminate: ctx.partialBold && !ctx.bold }
    },
    run: (ctx) => {
      ctx.bold = !ctx.bold
    },
  }
}

test('记忆化 + 合帧：一千次选区变化只重算一轮', () => {
  const pump = createPump()
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx, schedule: pump.schedule })
  const store = createStore()

  const counter = { calls: 0 }
  for (let i = 0; i < 200; i++) {
    registry.register({
      id: `cmd.${i}`,
      label: `命令 ${i}`,
      state: () => {
        counter.calls += 1
        return { enabled: true, value: i }
      },
      run: () => {},
    })
  }
  registry.bind(store)
  pump.flush()

  const baseline = counter.calls
  assert.equal(baseline, 200, '首轮应当每个命令只求值一次')

  for (let i = 0; i < 1000; i++) store.notify()
  assert.equal(pump.pending(), 1, '一千次通知只排了一帧')
  pump.flush()

  // 不做合帧会是 1000 × 200 = 200000 次
  assert.ok(counter.calls - baseline <= 200, `实际增量 ${counter.calls - baseline}，记忆化或合帧失效`)

  for (let i = 0; i < 100; i++) registry.state('cmd.7')
  assert.equal(counter.calls, baseline + 200, '未失效时重复取值不得重新求值')
  registry.dispose()
})

test('run 抛错不污染 active：引擎没改成就还是原样，改了一半就反映这一半', async () => {
  const pump = createPump()
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const seen: unknown[] = []
  const registry = createCommandRegistry<Editor>({
    context: () => ctx,
    schedule: pump.schedule,
    onError: (error) => seen.push(error),
  })

  registry.register({
    ...boldCommand(),
    run: () => {
      throw new Error('engine offline')
    },
  })
  registry.register({ ...boldCommand(), id: 'format.boldHalf' })

  pump.flush()
  assert.equal(registry.state('format.bold')?.active, false)

  const boom = await registry.run('format.bold')
  pump.flush()
  assert.equal(boom.ok, false)
  assert.equal((boom.error as Error).message, 'engine offline')
  assert.equal(registry.state('format.bold')?.active, false, '注册表不得替引擎乐观地翻转 active')
  assert.deepEqual(seen, [boom.error], '错误必须经 onError 上报，不能被吞掉')

  // 引擎真的改了：run 成功，active 必须跟上真相
  const ok = await registry.run('format.boldHalf')
  pump.flush()
  assert.equal(ok.ok, true)
  assert.equal(registry.state('format.boldHalf')?.active, true)
  registry.dispose()
})

test('重复注册：dev 告警并覆盖，prod 静默覆盖', async (t) => {
  const warn = t.mock.method(console, 'warn')
  const pump = createPump()
  const dev = createCommandRegistry({ dev: true, schedule: pump.schedule })
  dev.register({ id: 'a', label: 'first', run: () => {} })
  dev.register({ id: 'a', label: 'second', run: () => {} })
  assert.equal(warn.mock.callCount(), 1, 'dev 模式必须就重复 id 告警一次')
  assert.equal(dev.get('a')?.label, 'second')

  const prod = createCommandRegistry({ schedule: pump.schedule })
  prod.register({ id: 'a', label: 'first', run: () => {} })
  prod.register({ id: 'a', label: 'second', run: () => {} })
  assert.equal(warn.mock.callCount(), 1, '生产模式不该再告警')
  assert.equal(prod.get('a')?.label, 'second')
  assert.equal(prod.list().length, 1, '同 id 覆盖不得变成两条')
})

test('history 三档：只有 undoable 进撤销栈，none 两处都不进', async () => {
  const pump = createPump()
  const stack: string[] = []
  const recents: string[] = []
  const history: OjHistoryAdapter = {
    transact(label, invoke) {
      stack.push(label)
      return invoke()
    },
    recordRecent(label) {
      recents.push(label)
    },
  }
  const registry = createCommandRegistry({ schedule: pump.schedule, history })
  const run = () => {}
  registry.register({ id: 'explicit', label: '显式可撤销', run, history: 'undoable' })
  registry.register({ id: 'defaulted', label: '缺省', run })
  registry.register({ id: 'transient', label: '瞬态', run, history: 'transient' })
  registry.register({ id: 'none', label: '纯视图', run, history: 'none' })

  for (const id of ['explicit', 'defaulted', 'transient', 'none']) {
    assert.equal((await registry.run(id)).ok, true)
  }
  assert.deepEqual(stack, ['显式可撤销', '缺省'], '缺省即 undoable：漏标撤销的格式命令会让用户丢找回能力')
  assert.deepEqual(recents, ['显式可撤销', '缺省', '瞬态'], 'history: none 不进最近命令')
})

test('when(ctx) 为假：既不出现在列表里，也不能被 run', async () => {
  const pump = createPump()
  const ctx: Editor = { editable: false, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx, schedule: pump.schedule })
  registry.register({ ...boldCommand(), when: (c) => c.editable })
  registry.register({ id: 'file.save', label: '保存', run: () => {}, when: () => true })

  assert.deepEqual(registry.list().map((c) => c.id), ['file.save'])
  assert.deepEqual(
    registry.list({ includeUnavailable: true }).map((c) => c.id),
    ['format.bold', 'file.save'],
  )
  assert.equal((await registry.run('format.bold')).skipped, 'when')

  ctx.editable = true
  registry.refresh()
  pump.flush()
  assert.deepEqual(registry.list().map((c) => c.id), ['format.bold', 'file.save'])
})

test('disabled 必须现算，渲染侧缓存的旧 state 不能放行命令', async () => {
  const pump = createPump()
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx, schedule: pump.schedule })
  let executed = 0
  registry.register({ ...boldCommand(), run: () => { executed += 1 } })

  pump.flush()
  assert.equal(registry.state('format.bold')?.enabled, true, '缓存里是可用')

  // 宿主直接改了引擎状态却没有通知注册表：缓存仍是旧的 enabled: true
  ctx.editable = false
  const result = await registry.run('format.bold')
  assert.deepEqual(result, { id: 'format.bold', ok: false, skipped: 'disabled' })
  assert.equal(executed, 0)
})

test('脏检查：值没变不通知，变了才通知并带上前值', () => {
  const pump = createPump()
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx, schedule: pump.schedule })
  registry.register(boldCommand())

  const calls: [unknown, unknown][] = []
  const off = registry.subscribe('format.bold', (state, previous) => calls.push([state.active, previous?.active]))
  pump.flush()
  assert.deepEqual(calls, [], '首轮无变化不该通知')

  ctx.bold = true
  registry.refresh()
  pump.flush()
  assert.deepEqual(calls, [[true, false]])

  // 值相同但对象是新的一次：仍不该通知，否则 Ribbon 每帧都在重渲染
  registry.refresh()
  pump.flush()
  assert.equal(calls.length, 1)

  off()
  ctx.bold = false
  registry.refresh()
  pump.flush()
  assert.equal(calls.length, 1, '退订后不该再收到通知')
})

test('i18n：label 可以是 IntlMessage，注册表按注入的 resolve 解析', async () => {
  const pump = createPump()
  const registry = createCommandRegistry({
    schedule: pump.schedule,
    resolve: (message) => (typeof message === 'string' ? message : `${message.key}:${String(message.params?.n)}`),
  })
  registry.register({
    id: 'review.accept',
    label: { key: 'review.acceptN', params: { n: 3 } },
    run: () => {},
  })
  const accept = registry.get('review.accept')
  assert.ok(accept)
  assert.equal(registry.resolve(accept.label), 'review.acceptN:3')

  const bare = createCommandRegistry({ schedule: pump.schedule })
  bare.register({ id: 'x', label: { key: 'some.key' }, run: () => {} })
  assert.equal(bare.resolve({ key: 'some.key' }), 'some.key', '没有 i18n 时退回 key，保证零依赖可运行')
})

test('list 排序与分组：order 优先，同 order 按注册次序；group 精确匹配', () => {
  const registry = createCommandRegistry({ schedule: () => {} })
  registry.register({ id: 'b', label: 'b', order: 2, group: '开始', run: () => {} })
  registry.register({ id: 'c', label: 'c', group: '开始', run: () => {} })
  registry.register({ id: 'a', label: 'a', group: '开始', run: () => {} })
  registry.register({ id: 'd', label: 'd', order: -1, group: '开始', run: () => {} })
  registry.register({ id: 'y', label: 'y', group: '审阅', order: 5, run: () => {} })
  assert.deepEqual(registry.list().map((c) => c.id), ['d', 'c', 'a', 'b', 'y'])
  assert.deepEqual(registry.list({ group: '开始' }).map((c) => c.id), ['d', 'c', 'a', 'b'])
  assert.deepEqual(registry.list({ group: '插入' }), [], '没有该分组就是空，不做模糊兜底')
})

test('生命周期：unregister / dispose / 未知 id', async () => {
  const pump = createPump()
  const store = createStore()
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx, schedule: pump.schedule })
  registry.register(boldCommand())
  registry.bind(store)
  pump.flush()

  assert.notEqual(registry.state('format.bold'), undefined)
  assert.equal(registry.unregister('format.bold'), true)
  assert.equal(registry.unregister('format.bold'), false)
  assert.equal(registry.state('format.bold'), undefined)

  const seen: unknown[] = []
  registry.subscribe('format.bold', (state) => seen.push(state.active))
  store.notify()
  pump.flush()
  assert.deepEqual(seen, [], '注销后的命令不该再广播')

  assert.equal((await registry.run('nope')).skipped, 'not-found')
  assert.equal((await registry.run('format.bold')).skipped, 'not-found')

  registry.dispose()
  store.notify()
  assert.equal(pump.pending(), 0, 'dispose 后源通知不再排帧')
  assert.equal(registry.state('format.bold'), undefined)
})

test('无 state 的命令给出统一默认形状，组件不必各自兜底', () => {
  const registry = createCommandRegistry({ schedule: () => {} })
  registry.register({ id: 'plain', label: '普通命令', run: () => {} })
  assert.deepEqual(registry.state('plain'), { enabled: true })
})

test('register 返回的注销函数只摘自己，不误删后来覆盖的同 id 命令', () => {
  const pump = createPump()
  const registry = createCommandRegistry({ schedule: pump.schedule })
  const first = registry.register({ id: 'dup', label: 'first', run: () => {} })
  registry.register({ id: 'dup', label: 'second', run: () => {} })
  first()
  assert.equal(registry.get('dup')?.label, 'second')
})

test('默认调度器在无 rAF 的环境退到宏任务', async () => {
  const ctx: Editor = { editable: true, bold: false, partialBold: false }
  const registry = createCommandRegistry<Editor>({ context: () => ctx })
  registry.register(boldCommand())
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(registry.state('format.bold')?.active, false)

  ctx.bold = true
  registry.refresh()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(registry.state('format.bold')?.active, true)
  registry.dispose()
})

test('bind 返回的解绑函数会真的断开源', () => {
  const pump = createPump()
  const store = createStore()
  const registry = createCommandRegistry<Editor>({ schedule: pump.schedule })
  registry.register(boldCommand())
  const unbind = registry.bind(store)
  assert.equal(store.listeners, 1)
  unbind()
  assert.equal(store.listeners, 0, 'Ribbon 卸载必须断开宿主订阅，否则每次选区变化都在给死组件算状态')
})

test('注册表不 import 任何框架：命令面可以被纯回调宿主完整消费', async () => {
  const pump = createPump()
  const registry: OjCommandRegistry = createCommandRegistry({ schedule: pump.schedule })
  const rendered: string[] = []
  registry.register({ id: 'legacy.sync', label: '同步到云端', keys: ['mod+s', 'mod+shift+s'], run: () => {} })
  registry.subscribe('legacy.sync', (state) => rendered.push(String(state.active)))
  pump.flush()
  const result = await registry.run('legacy.sync')
  pump.flush()
  assert.equal(result.ok, true)
  assert.deepEqual(rendered, [], 'state 未变化就不该重绘')
  assert.deepEqual(registry.get('legacy.sync')?.keys, ['mod+s', 'mod+shift+s'])
})
