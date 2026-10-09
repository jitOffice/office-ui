# ADR-0005: 命令注册表框架中立，响应式契约只用 `subscribe`

- 状态：Accepted
- 日期：2026-10-09
- 决策人：架构负责人（Qoder 代拟，待确认）
- 可回退性：不可回退（命令 API 是 Ribbon/菜单/快捷键/命令面板的共同上游，改一次等于全站重写；见 `prd/02` §9 第 1 条）

## 背景

命令注册表是全库唯一的事实源：同一个"加粗"要出现在 Ribbon 按钮、右键菜单、`Ctrl+B`、
命令面板、撤销历史和宏 API 六处，六处必须显示同一份 `enabled/active/indeterminate`。
因此"注册表用什么机制感知状态变化"这个决定会同时约束：

- **宿主形态**：需求 7 明确要能在 `<script>`/jQuery 老页面里用；
- **canvas 渲染**：网格、标尺、选区在 60fps 绘制循环里读状态；
- **服务端复用**：JitWord 协同服务端要在无 DOM、无 Vue 的环境里校验前端发来的命令是否合法
  （`when(ctx)` 与 `enabled` 必须能在 Node 里求值，否则服务端只能重抄一遍规则）；
- **M0 的可验证性**：本仓库的 CI 门禁目前必须在**没有 `node_modules`** 的环境下跑通。

## 备选方案

| 方案 | 优点 | 代价 |
|---|---|---|
| A. 直接用 Vue 的 `reactive/computed/watch` 做记忆化 | 细粒度依赖追踪免费得到；Vue 侧零适配代码 | 注册表从此必须 import vue → Node 校验与 jQuery 宿主都要拖一个 Vue；canvas 绘制循环里还得 `onScopeDispose`/`stop` 才能不泄漏 effect；M0 的零依赖测试直接失效 |
| B. 自带 signal 微内核（约 120 行 `createSignal/createComputed`），宿主必须用我们的原语暴露状态 | 细粒度、框架无关、可精确到"只重算受影响的那几个命令" | 宿主引擎（ProseMirror / 自研表格引擎 / Vue ref）已经各自有响应式，等于要求它们**再学一套原语**并把内部状态搬进我们的容器里。这是三个团队各两到三周的改造与一条永久的认知负担 |
| **C. 契约式：宿主只需提供 `subscribe(listener)`，注册表自己做失效代次 + rAF 合帧 + 记忆化 + 脏检查**（选定） | 三种宿主都能满足（Vue `watch`、Redux store、手写事件总线）；注册表零 import；Node 可直接跑 | 失效是**粗粒度**的：一次通知会重算所有命令的 `state()`，因此要求 `state()` 必须是 O(1) 读取；Vue 侧要写约 20 行适配层 |

## 决策

采用方案 C。`@jitoffice/shared` 的根入口**只导出框架无关运行时**，
`OjCommandRegistry` 与宿主之间唯一的响应式契约是：

```ts
interface OjReactiveSource { subscribe(listener: () => void): () => void }
```

配套语义一并钉死：

1. **合帧 + 记忆化**：`invalidate()` 只递增代次（`epoch`），真正的求值在下一次
   `requestAnimationFrame`（无 rAF 时退到宏任务）里跑一轮；同一代次内每个命令只求值一次，
   未失效时 `state(id)` 命中缓存不重新求值。
2. **脏检查以"上次广播值"为基准**，不是"上次求值"。缓存被 `state()` 顺手更新过，
   仍然必须在下一次真实变化时通知订阅者——两者混用会导致 Vue 侧的 ref 永久停在旧值。
3. **首次求值建立基线但不广播**：订阅方自己会先读一次 `state()`，
   再推一次"从 undefined 到当前值"是伪变化，会让每个按钮白渲染一遍。
4. **`run()` 的 `enabled` 现算，不用缓存**。渲染侧缓存的 `enabled: true` 放行一个
   刚被禁用的命令，就是执行了本不该执行的写操作。
5. **`run()` 不 rethrow**：结果对象用 `skipped`（`not-found | when | disabled`）与 `error`
   说明为什么什么都没发生。快捷键与右键菜单不该因为一个命令内部异常而打断整条输入链；
   但**绝不静默吞异常**——没配 `onError` 时走 `console.error`。
6. **`history` 缺省即 `undoable`**。漏标撤销的格式命令让用户失去找回能力；
   反向缺省（不进撤销栈）会让视图类命令污染 Ctrl+Z。两者都是 bug，但前者的后果是数据。
   `transient` 不进撤销栈、进"最近命令"；`none` 两处都不进。
7. **生命周期方法一律返回撤销函数**（`register`/`bind`/`subscribe`）。这是唯一能同时喂给
   Vue 的 `effectScope`、React 的 `useEffect` 清理和 jQuery 插件 `destroy` 而不泄漏的形态。

## 后果

**正面**

- 三种宿主共用一张表，服务端校验与 UI 显示不可能分叉——这正是"六处状态不一致"这个
  Office 界面头号 bug 源的根治。
- 注册表可脱离构建器与依赖安装被测试：`packages/shared/test/commands.test.ts` 的 15 个用例全部 `node --test` 直跑，不装包也不联网。
- Vue 适配层薄到可以在 code review 里逐行看住（一个 `shallowRef` + 一个订阅 + 一次解绑）。

**负面 / 需要配套的工程动作**

- 粗粒度失效把成本转嫁到一条**使用约束**上：`state()` 必须是 O(1) 读取，禁止在里头做遍历或
  异步。文档站要写死这条，并在 `OjCommand` 的 JSDoc 里重复。若将来真的出现某个 O(n) 的
  命令状态（例如"当前选中对象数量"），做法是给那**一个**命令单独加缓存，而不是回头改注册表。
- 宿主漏通知 = 状态不刷新。这是方案 C 相对 A/B 的真实弱点，缓解手段是
  `refresh()` 这个显式退路，以及在文档里把"必须 `bind` 引擎的状态源"列为接入第一步。
- 需要新增 `@jitoffice/shared/vue` 子路径（M1）承载 `useCommandState` 等适配组合式函数；
  根入口不得 import vue，这条要进契约检查。

## 证据

本机 Node 24 / Windows on ARM 实测（`packages/shared` 无调度器注入，手动泵帧）：

| 指标 | 实测 |
|---|---|
| 200 个命令求值一轮（含脏比较与 Map 迭代）× 2000 轮 | 11.0 ms → **每轮 0.006 ms** |
| 相对 16.7 ms 帧预算 | 约占 **0.04%**，即一帧里还有余量给 250 轮 |
| `state(id)` 命中缓存 × 100000 次 | 4.1 ms → 每次约 **41 ns** |

结论：在 200 命令这个量级上，粗粒度失效的代价小到不需要用细粒度依赖追踪来换——
而方案 A/B 为细粒度付出的分别是"绑定 Vue"和"重写三个引擎的状态层"。

对照真实事故形态：若不做合帧，一次拖选期间的每次 `selectionchange` 都会重算全部命令——
按 200 命令计，1000 次通知就是 **200000** 次求值。`commands.test.ts` 第一条用例
把"一千次通知只重算一轮"钉成回归门禁。

参考：`prd/03-component-system.md` §1、`prd/05-m0-delivery-plan.md` 轨道 D · D1、
实现 `packages/shared/src/commands/registry.ts`。
