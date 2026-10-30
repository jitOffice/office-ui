import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, onRenderTriggered, onUnmounted, ref } from 'vue'

import { createCommandRegistry } from '../../../shared/src/commands/index.ts'
import type { OjStateListener } from '../../../shared/src/commands/index.ts'
import { OjCommandButton, OjTooltip } from '../../src/vue/index.ts'

/**
 * 05 §2 DoD #4 原文：「同一命令分别渲染在按钮与 tooltip 文案中，改变 mock 状态后两处同步，
 * 且只触发一次重渲染」。
 *
 * 这条为什么不在 `node --test` 里做：它要的是**真实的重渲染次数**，而渲染是 Vue 调度器的行为。
 * 零依赖那条链连 vue 都不加载，只能验到注册表的通知层。
 *
 * 量法分三层，少一层就证明不了这句话：
 *   1. 通知层 —— 每个订阅方被回调几次（注册表合帧的直接证据）
 *   2. 渲染层 —— `onRenderTriggered` 的触发次数（Vue 真的只重渲染一次）
 *   3. DOM 层 —— 按钮的 `aria-pressed` 与 tooltip 文案都换成了新状态（两处真的同步了）
 */

interface MockContext {
  bold: boolean
  offline: boolean
}

/** 一帧之后再看：注册表合帧走 `requestAnimationFrame`，同步断言永远早一步。 */
async function settle(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
  await nextTick()
}

function setup() {
  const context: MockContext = { bold: false, offline: false }
  const registry = createCommandRegistry<MockContext>({
    context: () => context,
    // 走真实 i18n 形状：label 是 message 对象，由 resolve 翻成文案。
    resolve: (message) => (typeof message === 'string' ? message : `命令.${message.key}`),
  })

  const ran: unknown[] = []
  /**
   * 求值次数是**合帧唯一的可观测面**。
   *
   * 第一版这里只数"通知了几次"，结果去掉合帧（`defaultSchedule` 改成同步执行）照样绿——
   * 因为 `publish()` 里的脏检查会把后四次状态相同的推送挡掉，两次失效只算一次通知。
   * 脏检查与合帧是两道不同的闸，拿前者的现象去证明后者，是一条永远不会红的探针。
   */
  const calls = { state: 0 }
  registry.register({
    id: 'format.bold',
    label: { key: 'bold' },
    state: (ctx) => {
      calls.state += 1
      return { enabled: !ctx.offline, active: ctx.bold }
    },
    run: () => {
      context.bold = !context.bold
      ran.push(context.bold)
    },
  })

  const notified = { button: 0, tooltip: 0 }

  /**
   * 两个消费者各拿一个计数壳，数的是"这个消费者被通知了几次"。
   * 注册表的方法都是闭包、不依赖 `this`，所以展开是安全的。
   */
  const withCounter = (key: keyof typeof notified) => ({
    ...registry,
    subscribe: (id: string, fn: OjStateListener) =>
      registry.subscribe(id, (state, previous) => {
        notified[key] += 1
        fn(state, previous)
      }),
  })

  const tooltipRenders = ref(0)

  /** tooltip 侧的渲染点：订阅同一条命令，文案随状态变。 */
  const TooltipProbe = defineComponent({
    name: 'TooltipProbe',
    setup() {
      const state = ref(registry.state('format.bold'))
      const stop = withCounter('tooltip').subscribe('format.bold', (next) => {
        state.value = next
      })
      onUnmounted(stop)
      onRenderTriggered(() => {
        tooltipRenders.value += 1
      })
      return () => {
        const active = state.value?.active === true
        return h(OjTooltip, { label: active ? '取消加粗' : '加粗' }, () => h('span', { class: 'anchor' }, '触发器'))
      }
    },
  })

  return {
    context,
    registry,
    ran,
    calls,
    notified,
    tooltipRenders,
    TooltipProbe,
    buttonSource: withCounter('button'),
    tooltipSource: withCounter('tooltip'),
  }
}

describe('同一命令渲染在两个地方', () => {
  it('状态变化后两处同步，且各自只重渲染一次', async () => {
    const { context, registry, calls, notified, tooltipRenders, TooltipProbe, buttonSource } = setup()

    const button = mount(OjCommandButton, { props: { source: buttonSource, id: 'format.bold' } })
    const tooltip = mount(TooltipProbe)

    await nextTick()
    expect(button.attributes('aria-pressed')).toBe('false')

    // tooltip 的气泡只在打开时才进 DOM，所以文案要先把气泡打开再读。
    // 键盘 focusin 是**立即**开（hover 才走 400ms 延迟），这也是 D4 的要求。
    await tooltip.find('.oj-tooltip-anchor').trigger('focusin')
    expect(tooltip.find('[role="tooltip"]').text()).toBe('加粗')

    const rendersBefore = tooltipRenders.value
    const evalsBefore = calls.state
    notified.button = 0
    notified.tooltip = 0

    // 引擎侧一次性改了状态，并连喊五次「可能变了」——典型场景是一次选区变化让多条命令失效。
    context.bold = true
    registry.refresh()
    registry.refresh()
    registry.refresh()
    registry.refresh()
    registry.refresh()
    await settle()

    // 0. 求值层：五次失效只重算一次。这是合帧**唯一**不可被脏检查代劳的证据，
    //    去掉合帧后这里会变成 5，而下面的通知数仍然是 1（脏检查挡住了重复推送）。
    expect(calls.state - evalsBefore).toBe(1)

    // 1. 通知层：合帧把五次压成一次
    expect(notified.button).toBe(1)
    expect(notified.tooltip).toBe(1)

    // 2. 渲染层：Vue 只重渲染一次
    expect(tooltipRenders.value - rendersBefore).toBe(1)

    // 3. DOM 层：两处都换了
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('data-active')).toBe('')
    expect(tooltip.find('[role="tooltip"]').text()).toBe('取消加粗')

    button.unmount()
    tooltip.unmount()
  })

  it('状态没变就不重渲染：伪变化会让每个按钮白渲染一遍', async () => {
    const { registry, notified, tooltipRenders, TooltipProbe, buttonSource } = setup()
    const button = mount(OjCommandButton, { props: { source: buttonSource, id: 'format.bold' } })
    const tooltip = mount(TooltipProbe)
    await nextTick()

    const rendersBefore = tooltipRenders.value
    notified.button = 0
    notified.tooltip = 0

    // 宿主喊了「变了」，但重算出来的 state 与上一次逐字段相同（比如光标在同一条命令的
    // 可用区里移动）。这时候推一次通知，就是纯浪费——Ribbon 上几十个按钮会一起白渲染。
    registry.refresh()
    registry.refresh()
    await settle()

    expect(notified.button).toBe(0)
    expect(notified.tooltip).toBe(0)
    expect(tooltipRenders.value).toBe(rendersBefore)

    button.unmount()
    tooltip.unmount()
  })

  it('禁用态：两处都不该显示为可用，且点击不执行命令', async () => {
    const { context, registry, ran, TooltipProbe, buttonSource } = setup()
    const button = mount(OjCommandButton, { props: { source: buttonSource, id: 'format.bold' } })
    const tooltip = mount(TooltipProbe)
    await nextTick()

    context.offline = true
    registry.refresh()
    await settle()

    expect(button.attributes('aria-disabled')).toBe('true')
    await button.trigger('click')
    // 渲染侧缓存可能过期，`run()` 必须现算 enabled —— 否则「看得见是灰的，但点了还是会执行」
    expect(ran).toEqual([])

    button.unmount()
    tooltip.unmount()
  })

  it('卸载后不再收到通知：订阅必须跟着组件生命周期走', async () => {
    const { context, registry, notified, TooltipProbe, buttonSource } = setup()
    const button = mount(OjCommandButton, { props: { source: buttonSource, id: 'format.bold' } })
    const tooltip = mount(TooltipProbe)
    await nextTick()

    button.unmount()
    tooltip.unmount()
    notified.button = 0
    notified.tooltip = 0

    context.bold = true
    registry.refresh()
    await settle()

    // 泄漏的订阅不仅浪费，还会在组件已卸载后写 ref —— 开发模式下 Vue 会告警
    expect(notified.button).toBe(0)
    expect(notified.tooltip).toBe(0)
  })
})
