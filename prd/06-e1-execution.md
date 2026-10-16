# E1 执行计划：命令闭环、表格框选、分隔线

执行记录（2026-10-16）：下表 8 项都已落地。`pnpm verify` 89 个用例通过，`pnpm build:check` 三个包产物与源码同源，`pnpm typecheck` 0 error。demo（`packages/ui` 下 `pnpm dev`）里点过加粗、分隔线、10×20 框选：移出网格后文案停在「2 × 3 表格」，方向键改为「2 × 4 表格」，点击提交 `insert.table {"rows":1,"cols":1}`。



把 [需求文档](https://aiknow.jitword.com/know/share/d/92SfR0i83a) 的 V1.0 清单收成第一段能验收的代码。分隔线的节点语义对齐 [Tiptap HorizontalRule](https://tiptap.dev/docs/editor/extensions/nodes/horizontal-rule)：解析 `<hr>`、命令插入、光标落到规则后、文末补段落、行首 `---` 转节点。这些属于编辑器内核。本仓库没有 JitWord / Tiptap 源码，E1 只交付**命令桥**，不在组件库里重写节点。

前置阅读：[03 组件体系](./03-component-system.md) §1、§4，[ADR-0003](../docs/adr/0003-no-per-component-css.md)，[ADR-0004](../docs/adr/0004-zero-runtime-dependencies.md)，[ADR-0005](../docs/adr/0005-framework-neutral-command-registry.md)。

## 范围

做：

1. `@jitoffice/ui` 行为层（框架无关，`pnpm verify` 不装依赖也能跑）。
2. 三条命令：`format.bold`、`insert.horizontalRule`、`insert.table`。
3. `OjEditorHost`：`can` / `exec` / `state` / `subscribe`。另给一个不 import Tiptap 的结构适配 `tiptapEditorHost`。
4. 表格框选模型：悬停高亮、移出不清空、方向键、`Enter` 提交、`Esc` 关闭、上限 `10×20`。
5. 浮层定位与 Tooltip 400ms 延迟的纯函数。
6. 三枚自绘图标（加粗、表格、分隔线），只发 SVG 字符串。
7. 一份 `style.css`（ADR-0003：不按组件拆 CSS）。
8. Vue 渲染层走 `@jitoffice/ui/vue` 子路径：`OjIcon`、`OjCommandButton`、`OjTooltip`、`OjPopper`、`OjDropdown`、`OjTableGridPicker`。根入口不 import `vue`。
9. 四语命令文案。

不做（留给后续执行单）：

- 弹窗、文件列表、标尺、缩放、查找替换、AI 侧边栏、签名、印章、水印。
- `@jitoffice/word` 包，以及在本仓库内实现 `<hr>` 节点。内核接入时调用 `editor.commands.setHorizontalRule()`，适配层已经按这个方法名对接。
- 图标构建管线与 30 枚图标。E1 只交这三枚，证明注册表能喂给按钮。
- UMD。`ui` 的 Vue 子路径要等全局 `Vue` 外部化单独一趟，本切片不产 `dist/umd`。

## 依赖方向

```
@jitoffice/shared   已有，命令注册表
@jitoffice/i18n     已有，补三条命令文案
@jitoffice/tokens   已有，样式只引用变量
@jitoffice/ui       本切片。dependencies 为空
                    根入口不 import vue、不 import 其它 @jitoffice 包
                    ./vue 子路径以 vue 为可选 peer
```

行为层用**结构类型**接收注册表，这样 `node --test` 在没有 `node_modules` 时仍能沿相对路径跑通。Vue 文件里的 `vue` 是唯一的裸导入，测试不加载它。

## 任务

| # | 任务 | 验收 |
|---|---|---|
| 1 | `packages/ui` 包、构建登记、`src/style.css` 复制进 `dist/style.css` | `exports` 指向的文件存在；`dependencies` 为空；根入口模块图没有 `vue` |
| 2 | `OjEditorHost`、`createMemoryEditor`、`tiptapEditorHost` | 假编辑器上 `format.bold` 的 `active` 能经 `subscribe` 推到注册表；Tiptap 形对象的 `setHorizontalRule` 被调用且不 import `@tiptap/*` |
| 3 | `registerEditorCommands` | `insert.table` 只接受正整数 `{ rows, cols }`；三条命令 `history` 为 `undoable`；`enabled: false` 时 `run` 得到 `skipped: 'disabled'` |
| 4 | `createGridPicker` | 移出网格不清空悬停；越过 `10×20` 置 `exceeded` 且不改当前格；`Home`/`End`/`Enter`/`Escape` |
| 5 | `placePopper`、`createTooltipMachine` | 下方放不下就翻到上方；400ms 未到离开则不打开 |
| 6 | 三枚图标 + 组件样式 | SVG 使用 `currentColor`；高亮是一层 overlay，变量名 `--oj-gp-row` / `--oj-gp-col` |
| 7 | Vue 六个组件与 `packages/ui/demo` | 浏览器里能点加粗、插入分隔线、框选表格并看到命令日志 |
| 8 | 四语 `oj.command.bold` / `horizontalRule` / `insertTable` | `i18n:gen` 后 key 表与四语一致，i18n 产物重建 |

## 命令与宿主

```ts
interface OjEditorHost {
  can(id: string): boolean
  exec(id: string, arg?: unknown): boolean
  state(id: string): OjCommandState
  subscribe(listener: () => void): () => void
}
```

`state` 比先前口述的三方法多一个字段：加粗需要 `active`，只靠 `can()` 表达不了。`subscribe` 与 `OjReactiveSource` 相同，可以直接 `registry.bind(host)`。

| 命令 id | 宿主方法（Tiptap 形） | 参数 |
|---|---|---|
| `format.bold` | `commands.toggleBold()`，`isActive('bold')` | 无 |
| `insert.horizontalRule` | `commands.setHorizontalRule()` | 无 |
| `insert.table` | `commands.insertTable({ rows, cols })` | `{ rows, cols }` 正整数 |

分隔线节点本身（光标、文末段落、`---` 输入规则）留在内核，按 Tiptap `HorizontalRule` 实现。适配层不复制这套 transaction。

## 已知取舍

- 组件默认网格上限是 `prd/03` §4 的 **10 行 × 20 列**。tokens 里的 `--oj-grid-picker-max-rows/cols` 仍是 10。E1 不改 token 表，组件用自己的上限。
- 格子边长组件默认 24px（`prd/03` §4 的 `cell-size`）。token `--oj-grid-picker-cell` 仍是 16px，组件用内联变量盖过。
- Vue 组件用 `defineComponent` + `h()`，不引入 `.vue` SFC 与 `vue-tsc`。样式构建仍是「一份 CSS」，不走按组件拆包。
