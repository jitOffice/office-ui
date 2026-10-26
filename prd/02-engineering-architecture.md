# 工程架构与构建产物

## 1. Monorepo 布局

pnpm workspace + Turborepo（均 MIT）。不选 Lerna（慢）、Rust 工具链（团队上手成本）、Nx（功能过剩，且其插件生态会引入非 MIT 依赖面）。

```
office-ui/
├─ packages/
│  ├─ tokens/                 @jitoffice/tokens        无依赖
│  ├─ icons/                  @jitoffice/icons         依赖 tokens（仅尺寸）
│  ├─ shared/                 @jitoffice/shared        根入口框架无关（命令注册表）；Vue 组合式函数走 /vue 子路径
│  ├─ i18n/                   @jitoffice/i18n          无依赖
│  ├─ ui/                     @jitoffice/ui            L1 主体
│  ├─ docs-shell/             @jitoffice/docs-shell    L2
│  ├─ sheet-shell/            @jitoffice/sheet-shell   L2
│  ├─ slide-shell/            @jitoffice/slide-shell   L2
│  └─ presets/                @jitoffice/preset-*      整页模板
├─ playground/                沙箱运行时（iframe + compiler-sfc + importmap）
├─ docs/                      VitePress 文档站（三语）
├─ internal/
│  ├─ build/                  共享 vite/rollup 配置、namespace 注入、@layer 双构建
│  ├─ lint/                   eslint / stylelint 规则与卡关脚本
│  └─ scripts/                图标生成、token 生成、i18n key diff、API 抽取
└─ prd/                       本套设计文档
```

依赖方向严格单向，CI 校验不得成环：
```
tokens ← icons ← shared ← ui ← docs-shell/sheet-shell/slide-shell ← presets
                    ↑
                  i18n ────────┘（ui 依赖 i18n）
```

### `packages/ui` 内部结构（决定 tree-shaking 成败）
```
components/
  button/
    Button.vue
    style/index.scss
    style/css.ts              仅做样式注册，无副作用
    index.ts                  export { OjButton } / export { buttonProps }
    __tests__/button.spec.ts
  index.ts                    聚合导出（每个组件一行 export * from './button'）
```
**每个组件必须有自己的 `index.ts` 入口**，且 `components/index.ts` 只做 re-export 不含任何逻辑。任何在聚合入口里写 `const install = ...` 的做法都会让 tree-shaking 失效（打包器无法证明副作用可剔除）。

---

## 2. 产物矩阵

`@jitoffice/ui` 的 `package.json`：

```jsonc
{
  "name": "@jitoffice/ui",
  "version": "0.1.0",
  "license": "Apache-2.0",
  "type": "module",
  "main": "./dist/cjs/index.cjs",           // CJS：webpack4 / Jest / 老 Node
  "module": "./dist/es/index.js",           // 旧打包器兼容
  "types": "./dist/types/index.d.ts",
  "unpkg": "./dist/umd/office-ui.min.js",   // <script> 用户
  "jsdelivr": "./dist/umd/office-ui.min.js",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/es/index.js",
      "require": "./dist/cjs/index.cjs"
    },
    "./style.css":        "./dist/styles/office-ui.css",
    "./tokens.css":       "./dist/styles/tokens.css",
    "./es/components/*":  "./dist/es/components/*/index.js",
    "./styles/*.css":     "./dist/styles/components/*.css",
    "./resolver":         "./dist/resolver/index.js",
    "./package.json":     "./package.json"
  },
  "sideEffects": [
    "**/*.css",
    "**/*.scss",
    "./dist/es/styles.js"
  ],
  "web-types": "./dist/web-types.json",     // WebStorm 智能提示
  "vetur": { "tags": "./dist/vetur/tags.json", "attributes": "./dist/vetur/attributes.json" },
  "files": ["dist", "README.md", "LICENSE"],
  "peerDependencies": { "vue": "^3.4.0" },
  "dependencies": {}                          // ← 必须为空，见 §3
}
```

`sideEffects` 用**数组白名单**而非 `false`：只有样式文件是副作用源。写成 `false` 会让打包器删掉"看起来没人用"的样式注册代码，导致组件无样式——这是按需引入类 issue 的头号成因。

这条规则**只适用于会发射样式的包**。`tokens` 之外的纯逻辑包（`shared`、`i18n`）根本没有样式入口，
`sideEffects: false` 才是正确的，能让打包器把没用到的命令注册表整棵摇掉。
`check-contracts.ts` 因此把判定写成"导出面里有 `.css` 才禁止 `false`"，而不是一刀切。

### 四套产物，三种构建配置

| 产物 | 工具 | 关键点 |
|---|---|---|
| `dist/es/` | Vite lib mode，`preserveModules: true` | **必须保留模块结构**，这是 tree-shaking 的前提。`preserveModules` 会让每个组件产出独立 chunk，且 Rollup 会把共享代码提到 `_chunks/`，需配置 `experimentalMinChunkSize` 避免碎片化 |
| `dist/cjs/` | 同**一趟** Vite lib mode，`formats: ['cjs']` | 与 ESM 同源，仅格式转换。**不要**用 `esbuild --format=cjs`（会丢掉 `preserveModules` 结构，导致 CJS 用户全量引入） |
| `dist/types/` | 纯 TS 包：`tsc --emitDeclarationOnly`；含 `.vue` 的包：`vue-tsc` | SFC 的类型必须由 vue-tsc 产出，`tsc` 不认 `.vue`；没有 SFC 的包**不该**为它付 vue-tsc 的启动成本 |
| `dist/umd/` | Vite lib mode，`formats: ['umd']` | 见 §4 |

> **A2 第一切片实测**（vite 8.3.4 = rolldown 1.2.13，`shared`/`i18n` 两条纯 TS 链）：
> 打包器选项写 `rolldownOptions`（`rollupOptions` 是过渡别名，两者产出逐字节相同）；
> CJS 由同一次 vite 调用的 `formats: ['cjs']` 产出，**不需要** `@rollup/plugin-commonjs`；
> UMD 必须显式写 `output.entryFileNames: '[name].js'`，否则 `"type": "module"` 的包里 vite 会产出
> `*.umd.cjs`，把 §4.1 的 `<script src>` 契约和兼容线的 `**/*.js` glob 一起弄坏；
> 多个 UMD 目标共用一个 outDir 时**只有组内第一趟**能 `emptyOutDir`，否则后趟删掉前趟的产物；
> 各趟串行执行，并行会抢同一个 outDir。完整清单见 05 偏差 15。

**UMD 与 ESM 不能共用一次构建**：UMD 要求 Vue 作为全局 `Vue` 外部依赖、要求 CSS 内联或单独产物、要求关闭 `preserveModules`。分开两条 Vite 配置，各自明确。

### 2.1 样式入口必须单独一趟构建（最易踩的坑）

Element Plus 现在的构建器是 **rolldown**（`internal/build/src/tasks/full-bundle.ts` 里 `import { rolldown } from 'rolldown'`），且**跑两趟**：

| 趟 | 目标 | treeshake 配置 |
|---|---|---|
| 1 | 组件代码 | `{ moduleSideEffects: false }` ——  aggressively 剔除未用组件 |
| 2 | 样式入口（glob `**/style/(index|css).{js,ts}`） | **`treeshake: false`** —— 一行都不剔 |

第二趟的存在理由：样式入口文件的内容就是一句 `import '../../theme-chalk/el-button.css'`，它**唯一的价值就是副作用**。用第一趟的配置跑，打包器会判定"没人用这个导出的值"而整个删掉，产物压缩后**组件无样式**。

这个 bug 的症状是"本地 dev 正常、发布后样式丢失"，且报错信息里没有任何线索——排查成本极高。**M0 就要把两趟构建分开，并在 CI 里加一条断言**：取任一组件的按需样式入口产物，检查其中仍含 CSS 引用。

### 2.2 `exports` 需要通配子路径

按需引入要求深路径合法，`exports` 里必须显式开：
```jsonc
"./es/*": "./es/*",
"./lib/*": "./lib/*",
"./*": "./*"
```
最后一条 `./*` 是逃生门（让用户能引 `@jitoffice/ui/dist/styles/components/button.css` 这类未预告的路径）。它的开放性与"API 收敛"有张力：**保留但只承诺 `exports` 中显式列出的路径为稳定 API**，通配路径随时可变。这条要写进文档，否则会有人依赖通配路径然后在大版本升级时投诉。

---

## 3. 零运行时依赖策略

`packages/ui` 的 `dependencies` 必须为空对象，CI 用脚本断言。

理由：
1. 需求 6"商用无风险"——依赖树越浅，许可审计面越小。
2. 需求 7"能在 jQuery 项目里用"——任何 npm 依赖都要在 UMD 里打包，Popper/Lodash/Dayjs 会让 UMD 体积失控。
3. 组件库被大量项目引用，一个 `ms` 级依赖的漏洞就是全生态事件。

因此以下能力**必须自研**（这也是为什么 L1 只有 45 个组件却要 20 周）：

| 能力 | 自研要点 |
|---|---|
| 浮层定位 | `usePopper`：支持锚定矩形（选区）、多区间包围盒、边界翻转、`strategy: fixed`、避免 `position: absolute` 在滚动容器内抖动 |
| 日期/数字/复数 | 委托 `Intl`（原生，非依赖）。注意信创老 Chromium 的 `Intl` 完整度需实测 |
| 深比较/节流/防抖 | `shared/` 内约 200 行 |
| 快捷键解析 | `'mod+shift+b'` 解析 + 平台映射 + 冲突检测 + 事件捕获阶段拦截 |
| 虚拟滚动 | 变高 + 锚点稳定（上方插入不跳动），这是办公大纲/评论列表的刚需 |

允许进 `dependencies` 的例外：**无**。若某天必须引入，需走 ADR + 许可审计 + 体积评审。

### 反面教材：`vue-devui`

它的 `package.json` 同时具备四个缺陷：`main` 直指 UMD 文件、**没有 `exports`**、**没有 `sideEffects`**、**没有 `types`**，且 `dependencies` 里是 `monaco-editor, echarts, codemirror, katex, mermaid, diff2html, rxjs, xss, markdown-it-*, fs-extra`。一个浏览器组件库把 `fs-extra` 和 Monaco 写成运行时依赖的结果是：任何人装它都躲不掉这些引擎，按需安装变成不可能。

由此定规则：**任何编辑器引擎或重型渲染库（ProseMirror / 表格引擎 / Monaco / ECharts / katex）只能是某个独立 `@jitoffice/*` 包的 `peerDependencies`，永远不进 UI 包的 `dependencies`。** 除了体积，还因为这类包会带入 CSP 不友好的 worker 与字体资源（Monaco 尤甚），一旦硬编码，所有下游用户都要为你的选型买单。

---

## 4. 无构建器 / jQuery 场景（需求 7）

这是本库最容易被低估、也最有真实需求的一块。用户 A（业务系统集成商）的存量项目往往没有打包器。

### 4.1 基础 UMD
```html
<link rel="stylesheet" href="/dist/styles/tokens.css">
<link rel="stylesheet" href="/dist/styles/office-ui.css">
<script src="/vendor/vue.global.prod.js"></script>
<script src="/dist/umd/office-ui.min.js"></script>
<script>
  const { createApp } = Vue
  const app = createApp({ /* … */ })
  app.use(OfficeUI)          // 全量注册
  app.mount('#app')
</script>
```
UMD 里 **Vue 必须是 external**（`globals: { vue: 'Vue' }`），否则会出现两个 Vue 实例导致响应式失效——这是 UMD 组件库的第一大坑，必须在文档里用红色警告框写出。

**第二大的坑：Vue 的全局构建版本。** 无构建器用户必须引 `vue/dist/vue.global.prod.js`（**含模板编译器**），而不是 `vue.runtime.global.prod.js`。因为：
- 没有构建器就没有 SFC 预编译，任何用 `template: '...'` 字符串声明的组件在 runtime-only 版本下会**静默渲染为空白**，只留一句 "Component provided template option but runtime compilation is not supported" 的警告。
- `data-oj` 声明式水合（§4.3）与 in-DOM 模板同样依赖编译器。

文档里要把这条放在安装页第一屏。这是无构建器场景 90% 的"组件不显示"工单来源。

**语言包也要发 UMD 分文件**：`dist/locale/ja.js` → 全局 `OfficeUILocaleJa`（`exports: 'default'`，同时输出 AMD）。jQuery/老项目用户不会打包，只能靠 `<script src="/locale/ja.js">`。

**必须发布 IDE 元数据**：`web-types.json`、`tags.json`、`attributes.json`（Element Plus、ant-design-vue、Arco 都做了，分别从 `pre-publish generator-webtypes`、`jsongen` 等脚本机械生成）。无 TS 的 jQuery 项目用户在 WebStorm/VSCode 里靠这些文件获得标签与属性补全——对目标用户 A 而言这是"好不好用"的直接体感，且成本几乎为零，因为数据源与文档 API 表相同（见 04 号文档 §5）。

### 4.2 命令式 API（不需要懂 Vue）
jQuery 项目里最自然的用法不是 `createApp`，而是"给我一个 DOM 节点，在上面渲染组件"：

```js
// 在 jQuery 事件里直接创建一个表格选择器
$('#insert-table').on('click', function () {
  const picker = OJ.create('oj-table-grid-picker', {
    anchor: this,
    props: { max: { rows: 10, cols: 20 } },
    on: {
      select: (s) => editor.insertTable(s.rows, s.cols),
      close:  () => picker.destroy(),
    },
  })
})

picker.setProps({ open: false })   // 受控更新
picker.destroy()                   // 必须显式卸载，否则内存泄漏
```

`OJ.create()` 内部为该组件创建一个独立 Vue app 实例。**代价必须写进文档**：每个 `create` 是独立 app，不共享 provide/inject 上下文，因此 `OJ.create` 的第二个参数需支持 `locale`/`density`/`theme` 透传，否则用户会遇到"命令式创建的弹层里文案是中文、页面是日文"这类不一致。

### 4.3 声明式自动水合（最贴近 jQuery 生态的用法）
```html
<div id="toolbar" data-oj="ribbon" data-oj-props='{"tabs":["开始","插入","审阅"]}' data-oj-locale="ja-JP"></div>
<script>
  OJ.hydrate('#toolbar')            // 扫描 data-oj 并挂载
  OJ.hydrate()                      // 全页扫描
</script>
```
`data-oj-props` 用 JSON 解析，**必须 try/catch 并在控制台输出定位到具体元素**（HTML 属性里写 JSON 是高频出错点）。同时提供 `data-oj-prop-*` 逐属性写法作为容错替代：
```html
<div data-oj="table-grid-picker" data-oj-prop-max-rows="10" data-oj-prop-on-select="window.pickTable"></div>
```

### 4.4 老浏览器与信创环境
> **基线已拍板（2026-10-09，ADR-0002 → Accepted）：legacy 线 floor = Chromium 86。** 因此下面这些不再是备选设计，A2 的 `modern`/`legacy` 两趟构建与两份 CSS 输出都是交付前提。仍缺一份可实测的内核版本清单（见 05 §0 B2）；`ES2018` 这一条与清单无关，无论 Firefox ESR 78 是否留在范围内都取它——它比 86 能吃的 ES2020 更保守，成本只在产物体积。

- UMD 目标语法 **ES2018**（不用 `?.` `??` 的转译产物，或转译到 ES2018）。信创主流是 360 安全浏览器（Chromium 86 内核）与麒麟自带 Firefox ESR——Chromium 86 支持 ES2020，但 Firefox ESR 78 不支持逻辑赋值运算符。保守取 ES2018。
- **不使用 `@layer` 作为唯一手段**（Chromium 99+ / Safari 15.4+ 才支持）。构建产出两份 CSS：`office-ui.css`（无 layer，默认）与 `office-ui.layered.css`（有 layer，供现代浏览器解决特异性战争）。用 `<link>` 二选一。
- `backdrop-filter` 用 `@supports` 包裹，降级为不透明背景（见 04 号文档）。
- `EyeDropper API`（取色器）仅 Chromium 95+，必须提供 `<input type="color">` 降级路径。

### 4.5 ESM-in-browser 替代路径
现代无构建器项目可用 importmap，体积比 UMD 小（能 tree-shake）：
```html
<script type="importmap">
{ "imports": {
    "vue": "/vendor/vue.esm-browser.prod.js",
    "@jitoffice/ui": "/dist/es/index.js"
} }</script>
<script type="module">
  import { OjTableGridPicker } from '@jitoffice/ui'   // 只加载用到的模块图
</script>
```
限制：`preserveModules` 会产生大量小文件请求，需服务端 HTTP/2 或预打包。**推荐顺序**：有构建器 → ESM；无构建器现代浏览器 → importmap；jQuery/老项目 → UMD。

---

## 5. 按需引入与样式策略（一个与主流相反的决策）

### 5.1 JS 侧：正常 tree-shaking
```ts
import { OjButton, OjTableGridPicker } from '@jitoffice/ui'
```
配合 `preserveModules` + `sideEffects` 白名单，Vite/webpack5 能正确剔除未使用组件。

同时提供 `unplugin-vue-components` resolver，免 import：
```ts
// vite.config.ts
Components({ resolvers: [JitOfficeResolver({ importStyle: 'css' })] })
```
resolver 必须支持 `namespace` 与 `exclude`，且默认**不自动导入样式**（见下）。

### 5.2 CSS 侧：不做逐组件样式分包
Element Plus 的 `element-plus/es/components/button/style/css` 逐组件样式路径值得学习吗？**对本库不值得。**

原因：本库所有视觉都来自 `@jitoffice/tokens` 的 CSS 变量层。用户只要用到任何一个组件，就必然需要完整的 token 变量表（约 4 KB gzip）。而 L1 全部组件的样式总量约 12 KB gzip。逐组件拆分最多省 10 KB，代价是：
- 每个组件要维护样式依赖图（Button 依赖 Popper 的样式吗？Ribbon 依赖 Tooltip 的吗？）——这是长期维护地狱。
- 自动导入与手动导入混用时必然出现样式重复或丢失。
- SSR 下逐组件样式注入的顺序不可控，导致特异性冲突随机化。

**决策**：两份 CSS，一次引入。
```ts
import '@jitoffice/tokens/style.css'   // 4 KB，必需
import '@jitoffice/ui/style.css'       // 12 KB，全量组件样式
```
并在文档里诚实说明："本库 JS 支持 tree-shaking，CSS 不支持逐组件分包，因为总量已小于拆分收益。" 这比假装支持按需样式更可信，也少一类 issue。

若未来组件数超过 80 或样式超过 40 KB，再引入拆分（届时通过 `exports` 增加子路径即可，属**向后兼容的扩展**，不会破坏现有用户）。

### 5.3 UMD 的样式
UMD 无法 `import './style.css'`（Rollup 会输出 JS 注入或丢弃）。提供两条路：
- `<link>` 引 CSS 文件（默认，可缓存、可 CSP）。
- `office-ui.full.js`：构建期把 CSS 字符串内联进 JS，运行时注入 `<style>`。**为 CSP 严格环境提供 `nonce` 配置项**：`OfficeUI.setCssNonce(cspNonce)`，否则内联样式会被 CSP 拦截且报错信息难以定位。

---

## 6. SSR / Nuxt

- **导入期禁止触碰 `document`/`window`**。所有 DOM 访问必须在 `onMounted` 内。`usePopper`/`usePortal`/`useMeasure` 需在 SSR 下返回安全的空实现。
- `OjPortal` 在 SSR 阶段渲染为注释占位，客户端 hydrate 后再 teleport，避免 hydration mismatch。
- 提供 `@jitoffice/nuxt` 模块（自动导入 + CSS 注入 + SSR 开关）。放在 M3，不在 v0.1。
- 文档站本身是 VitePress SSG，因此**所有组件在 SSR 下必须可渲染**——文档站就是这条约束的持续测试床。

---

## 7. 质量门禁

| 门禁 | 工具 | 阈值 |
|---|---|---|
| 单测 | Vitest + @vue/test-utils | 组件行覆盖 ≥ 85%；命令注册表与 `usePopper` ≥ 95%（这两个是全局故障源） |
| 交互测试 | Playwright（真实浏览器） | Ribbon 键盘导航、IME 输入、拖拽选区、焦点陷阱——**这些在 jsdom 里测不出来** |
| 视觉回归 | Playwright screenshot | `light/dark × comfortable/compact × zh/zh-TW/ja` 12 组，阈值 0.1%。`en` 不进这个积——它不覆写任何 token（01 §7），文案宽度另走"窄英/宽德不溢出"一组 |
| 无障碍 | `@axe-core/playwright` | 0 violation（`color-contrast` 规则单独处理，见 01 号文档 §8） |
| 体积 | size-limit | 全量 ESM gzip ≤ 90 KB；单组件 ≤ 6 KB；UMD ≤ 120 KB；CSS ≤ 16 KB。超标即 CI 失败并输出 diff |
| 许可 | `license-checker --onlyAllow` | 仅 MIT/Apache-2.0/BSD/ISC/OFL。出现其他即失败 |
| 类型 | `vue-tsc --noEmit` | 0 error，且 `dist/types` 需通过 `attw`（Are The Types Wrong）检查 ESM/CJS 双解析 |
| 依赖 | 自研脚本 | `packages/ui` 的 `dependencies` 为空；无循环依赖 |
| 一致性 | 自研脚本 | i18n 四语 key 集合完全一致；每个 prop 有 JSDoc；每个 `--oj-*` 变量在 token 表中有定义；组件 CSS 无字面色值 |
| 兼容性 | Playwright + Firefox ESR / Chromium 86 | UMD 产物在信创目标内核上可运行 |

**这张表是目标态，不是现状。** 现在真在跑的主体是零依赖那部分：
`internal/scripts/check-contracts.ts` 的十二条契约（含发布包 `dependencies` 为空、`sideEffects`、
`exports` 真实存在且**不指回 `./src/*`**、入库 `.d.ts` 的相对说明符可解析、`catalog:` 键、
`main`/`module`/`types` 与 `exports["."]` 逐字同源、有 `dist/umd` 就必须挂 `unpkg`/`jsdelivr`、
产物新鲜度、框架中立、i18n 生成表、**语言档位↔`html[lang|="…"]`
的变量覆写层与排版层双向比对**、治理文档链接、**组件样式变量必须命中 token 表且无字面色值**、
**`ui` 的 UMD 必须把 `vue` 留在外部**）+ `node --test` 的 107 个用例，细节见 01 §8。
`pnpm typecheck` 也已经真跑起来了：`tsc` 7.0.2 在四个包上 0 error——第一条 d.ts 缺陷正是它抓出来的，
运行时测试一条都看不见它。
A2 第一切片补上了表里**需要依赖**的那两行的前半段：`pnpm build` 出 ESM/CJS/types/UMD 四条链，
`pnpm build:check` 把源码重建结果与入库 `dist` 逐字节比对，再用 `es-check es2018` 扫兼容线产物
（`dist/umd` + `dist/locale`，7 个文件——`ui` 的两条 UMD 已并入）。
所以"类型"与"兼容性"两行现在是**部分成立**：三个发布包的 ESM/CJS/types 都过，
`ui` 的两条 UMD 也过 `es-check es2018`，但**信创老内核上的实测仍未开始**（没有可装的目标环境，
见 ADR-0002）；`attw`、size-limit、许可扫描仍属目标态。
Playwright 只开了个头：`packages/tokens/playwright.config.ts` 与 `test/visual/typography.spec.ts`
三条用例已落地（B5 第一切片，锁住 01 §7 那批数字），依赖进了 catalog，`turbo run test:visual`
已声明且刻意 `cache: false`。**三条已在 2026-10-09 真跑通过**，跑的是本机已装的两套内核
（Chrome 151.0.7922.175、Edge 154.0.4258.62，`OJ_BROWSER_CHANNEL=chrome|msedge`）；
Playwright 自己那份 197.5 MiB 的 `chrome-headless-shell` 在本机下到 10% 就再也不动，
所以口子留在配置里——内网机器同理拿不到 `cdn.playwright.dev`，而它挡的是下载、不是断言。
首次真跑立刻暴露了一个假锁：两条行为用例都在盒子上**内联**设值，读的其实是 UA 行为，
把产物改成 `line-break: auto` 它们照样绿。改成"不声明、从 body 继承"之后，
`line-break` 与 `text-autospace` 各做了一次故意破坏（改值 / 整条删掉），红与绿两条分支都实测过。
Vitest / axe / size-limit / license-checker / attw / vue-tsc 连配置文件都还没有，属于 A2、A3 的交付物，
PR 里不许把它们写成"lint 已过"（`CONTRIBUTING.md` §2 同条禁令）。

**测试优先级说明**：不要追求 90% 覆盖率数字。办公组件的高危区是"键盘导航、焦点管理、IME、选区、浮层定位"，这些恰是 jsdom 测不出来的。宁可 60% 单测覆盖 + 20 条 Playwright 真实交互用例，也不要 90% 覆盖 + 全是快照测试。

---

## 8. CI 与发布

GitHub Actions（`jitOffice/office-ui`）。

```
pull-request.yml    lint → typecheck → unit → build → size-limit → a11y → visual
preview.yml         构建文档站 + Playground，部署到 PR 预览环境（每个 PR 一个可点开的 URL）
release.yml         changeset version → 构建 → attestation → npm publish → GitHub Release
```

- **版本管理用 Changesets**（MIT）。每个 PR 必须附 changeset 文件，CI 校验缺失即失败。这同时强制了 changelog 质量——开源库没有好的 changelog 就没有升级意愿。
- 发布 `@jitoffice/*` 全部包，用固定版本（fixed versioning）：所有包共享一个版本号，避免"ui 0.3 要配 tokens 哪个版本"的支持噩梦。代价是版本号会"虚涨"，可接受。
- npm 发布启用 **provenance**（`--provenance`），用户可验证包来自本仓库某次 CI。企业采购的供应链审查越来越常问这一点。
- 每个 release 自动产出：npm 包、GitHub Release 附件（UMD + CSS）、文档站版本、CDN 同步（jsdelivr/unpkg 自动拉取，国内另配 fastly 镜像或自建 `cdn.jitword.com`，因为需求 7 的用户可能在内网）。
- **PR 预览环境是开源项目的隐形增长引擎**：贡献者不用本地跑起来就能看到效果，能显著降低外部贡献门槛（对应 00 号文档"外部贡献者 30 人"目标）。

### 工作区与供应链防护

下面是仓库里 `pnpm-workspace.yaml` 的真实内容（版本号按 registry 实测 latest 钉定，
改动前先复核，**不要凭记忆写**；`internal/scripts/check-contracts.ts` 会检查全包引用的
`catalog:` 键在这里真实存在）：

```yaml
packages:
  - 'packages/*'
  - 'docs'
  - 'playground'
  - 'internal/*'

catalog:                       # 一处声明版本，全仓用 `catalog:` 引用
  typescript: ~7.0.2
  '@types/node': ~24.19.1
  vue: ~3.5.43
  vite: ^8.3.4
  vitest: ^5.0.3
  '@vue/test-utils': ^2.5.1
  '@vitejs/plugin-vue': ^6.0.9
  sass: ^1.105.1
  turbo: ^2.11.7
  playwright: ^1.64.0
  '@playwright/test': ^1.64.0
  vitepress: ^1.6.4
  minisearch: ^7.2.0
  '@changesets/cli': ^3.0.3

catalogMode: prefer

# 供应链防护：拒绝安装发布不足 24h 的包。
minimumReleaseAge: 1440

# 允许执行安装期构建脚本的包，白名单制，其余一律不跑。
onlyBuiltDependencies:
  - esbuild
  - sass-embedded
```

`@types/node` 钉在 **24 线**而非最新，是为了跟 `engines.node` 的实际运行时对齐；
类型比运行时新会让代码用上本机跑不了的 API。

`onlyBuiltDependencies` 不是可选项而是**必须显式列白名单**：npm 11 / pnpm 默认拒绝依赖包
的安装期脚本，`esbuild` 与 `sass-embedded` 都要在 install 时拉平台原生二进制。
不在白名单里，症状是构建时"找不到 esbuild 可执行文件"这类看着像安装坏了的报错。
白名单制同时保住了供应链默认：其余任何依赖想跑安装脚本都会被挡。

`dedupePeers` 与 `patchedDependencies` 目前**没有启用**——前者要等真正出现重复 peer 实例
（Vue 组件包里典型症状是 `inject() must be called from a setup` 之类），后者要等真有上游
bug 要绕。预先写空壳配置只会让人以为它们已经在起作用。

`minimumReleaseAge` 是**性价比最高的一条安全配置**：npm 供应链投毒的主流路径是劫持维护者账号后立刻发一个带恶意代码的版本，几小时后才被发现。设成 1440 分钟即可在零成本下挡住这一类，而几乎不影响我们的正常开发（自己发布的包走本地 workspace，不经 registry）。

### 分支与节奏
- `main` 直出 npm；`feat/*` 短分支；`v0.x` 期间每两周一次 minor；安全补丁回补前两个 minor。
- 破坏性变更只允许在 minor（0.x）与 major（1.x+）进入，且必须配 codemod。

---

## 9. 需要立刻定下的不可回退项

按"改错的代价"排序：

1. **命令注册表 API**（03 号文档 §1）——所有工具栏/菜单/快捷键组件都读它，改一次等于全站重写。
2. **`--oj-` / `oj-` 命名空间**——发布即公开契约。定 `oj` 而非更长的前缀，因为 CSS 变量名会被用户大量手写覆写。
3. **三层 token 结构与双产物（CSS + JS）**——canvas 组件一旦开始硬编码颜色就再也收不回来。
4. **`preserveModules` 的 ESM 输出结构**——影响所有下游打包器的 tree-shaking 判定。
5. **`sideEffects` 白名单写法**——写错会静默丢样式，且症状看起来像"组件坏了"。
6. **CSS 不做逐组件分包**（§5.2）——反向决策，将来要支持是向后兼容的扩展，所以现在不做是安全的。
7. **L1 不依赖任何通用组件库、零运行时依赖**——一旦引入 Element Plus 就再也拿不掉。
