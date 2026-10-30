# 文档站与国际化

## 1. 文档站：一条硬约束决定全部选型

需求 3 要"蓝白毛玻璃 + 可搜索 + 在线预览"。但需求 6/国产化场景追加了一条**优先级更高的约束**：

> **文档站与 Playground 必须能在完全断网的内网环境自托管。**

这条约束直接否掉几个"业界常规"选项：

| 能力 | 常规做法 | 否决理由 | 采用方案 |
|---|---|---|---|
| 在线预览 | StackBlitz WebContainers / CodeSandbox SDK | 需访问 `*.stackblitz.com`，政企内网与信创环境不可达；且 WebContainer 不支持部分国产浏览器 | **自托管 iframe Playground**（§3） |
| 搜索 | Algolia DocSearch | 需公开站点申请 + 外部请求 + 索引外泄（内网文档不可接受） | **本地索引 minisearch**（§4） |
| 字体 | Google Fonts | 不可达 | 系统字体栈 + 可选自托管 OFL 字体 |
| CDN 演示 | unpkg / jsdelivr | 不可达 | 文档站构建产物内含本地 `vendor/`，离线可用 |
| 分析 | GA / Plausible | 隐私与内网 | 不接入 |

技术栈：**VitePress（MIT）+ 自定义 theme**。不选 Docusaurus（React 栈，与团队主栈不符）、不选 VuePress 1（Vue 2，已停维）、不自研（构建/Markdown 管线重复造轮子成本高，且 VitePress 的 `defineConfig` 扩展点足够）。

### ⚠ VitePress 自带一个离线陷阱

VitePress 默认主题的 `dist/client/theme-default/styles/fonts.css` 里**含有一句 `@import url('https://fonts.googleapis.com/css2?family=Inter…')`**。也就是说：直接用默认主题构建出的文档站，在内网会**静默发起 Google Fonts 请求**——页面能渲染（有回退），但首屏被一个永远超时的请求拖住，且这条请求会出现在客户的"外联审计"报告里。

对策：
1. 自定义主题**必须**从 `vitepress/theme-without-fonts` 继承，而不是 `vitepress/theme`。
2. 字体改为自托管 OFL：`@fontsource/inter`、`@fontsource/noto-sans-jp`（两者许可均为 `OFL-1.1`，可安全捆绑）。
3. **CI 加一条断言**：对 `docs/dist` 全量产物 grep `https?://`，白名单外的远程 URL 一律构建失败。这条规则要覆盖字体、脚本、图片、worker——它同时挡住本文档列出的所有其他外联风险，是"内网可用"承诺的机器化证明。

---

## 2. 视觉：把自家 token 用在自己身上

文档站必须**只用 `@jitoffice/tokens` + `@jitoffice/ui` 构建**，不允许任何写死样式。理由不是洁癖——文档站是组件库的**第一个真实消费者**，视觉不一致、token 不够用、组件在长页面下性能崩塌这类问题，只有在文档站上才会提前暴露。

```
docs/theme/
  styles/
    _glass.scss      毛玻璃基元（唯一允许的自定义样式层）
    _layout.scss
  components/
    OjDocNavbar.vue      顶栏：玻璃
    OjDocSidebar.vue     左侧分类：玻璃
    OjDocToc.vue         右侧目录
    OjDemoBlock.vue      示例卡片：白底 + 玻璃头栏
    OjHero.vue           首页
```

沿用实测基线（见 01 号文档）：

- 顶栏/侧栏：`--oj-bg-glass` + `--oj-glass-blur` + `1px solid --oj-border-1`
- 首页 Hero：`#F7F8FC` 底 + 极淡蓝网格纹理（JitKnow 首页同款）+ 大号黑体标题 + 蓝色强调行
- 示例卡片：上白下灰双区（预览区 `--oj-bg-container`，代码区 `#FAFBFF`），圆角 `--oj-radius-lg`，边框 `--oj-border-1`
- 主色 `#165DFF` 用于链接、当前菜单项、代码高亮关键字

**毛玻璃必须可关**：`backdrop-filter` 在文档站这种长页面 + 侧栏常驻的场景下，Safari 与国产 Chromium 分支上滚动掉帧明显。侧栏顶栏的玻璃层用 `@supports (backdrop-filter: blur(1px)) and (prefers-reduced-transparency: no-preference)` 双条件包裹，降级为不透明 `--oj-bg-container`。

**玻璃不能只是装饰**：`prefers-reduced-transparency` 是 Windows 系统级设置（"透明效果"开关），办公用户常年开着它。尊重该设置既是无障碍要求，也是"企业级"的真实体现。

### 信息架构
```
/            首页 Hero + 场景卡片 + 快速上手
/guide/      指南：安装 · 按需引入 · 主题定制 · 命令系统 · UMD/jQuery · SSR · 无障碍 · 迁移
/components/ 组件：按 §3 分组（图标/命令工具栏/选择器/浮层布局/审阅协同/文件生命周期）
/presets/    整页模板：合同审阅 · 公文排版 · 多维表格 · 知识库 —— 每个可实时交互
/tokens/     Design Token 浏览器（可实时改主色/密度/明暗，全站即时预览）
/changelog/
/playground/ 独立沙箱，可从任意示例"在 Playground 中打开"
```

`/tokens/` 页面值得单独做：一个可交互的 token 浏览器是设计系统的最佳说明书，也是竞品（Element Plus/Arco）都没有的差异化点，能显著降低"主题定制怎么做"的疑问类 issue。

### 组件文档页固定结构
1. 一句话说明 + 何时使用 / 何时**不**使用（后者几乎没人写，但最能减少误用）
2. 代码演示（每个 demo 独立可运行，右上角：预览 / 编辑 / 复制 / 在 Playground 打开）
3. API：Props / Events / Slots / Exposed / **CSS 变量**（本库特有，列出该组件所有 `--oj-*` 钩子）
4. 命令契约（若该组件消费命令）
5. 无障碍说明（键盘表 + ARIA）
6. 国际化（该组件用到的 `oj.*` key 与四语译文）
7. 设计稿链接 + 变更日志

CSS 变量表由构建期从组件源码扫描 `var(--oj-*)` 自动生成——**这是必须自动化的点**，手写文档一定漏。

---

## 3. 在线预览：自托管 iframe Playground

### 架构
```
playground/
  worker/         无（不用 WebContainer）
  frame/          index.html —— 沙箱页面，经典脚本：vue.global.js + office-ui.js(UMD) + 两份 CSS
  host/           与 VitePress 同页的编辑器 UI（Monaco 或 CodeMirror 6）
  build/          构建前由 prepare-playground.ts 从各包 dist 复制运行时，产物不入库
```
`docs/public/playground/` 由脚本独占生成，不提交源码级副本。

流程：
1. 宿主把源码字符串 `postMessage` 给 iframe：`{ type: 'oj-playground:run', code }`。
2. iframe 用 `new Function` 包一层 `Vue.createApp({ template: code })`，挂到内部容器。
3. 运行时全部本地：`vue.global.js`（含模板编译器）+ `office-ui.js`（UMD 全局 `OfficeUI`）+ tokens/ui CSS。
4. 挂载后沙箱回 `ok`；`ResizeObserver` 持续上报 `height`，宿主跟随调整 iframe 高度。
5. 报错捕获：语法错误、运行时错误、挂载错误三类分别回传 `error`，显示在预览区下方而非白屏。
6. 消息校验只认 `event.source === iframe.contentWindow`——origin 是 `null`，不可作为判据。

> **2026-10-30 实测修正（沙箱 × 模块）**：`sandbox="allow-scripts"` 的 iframe origin 是 `null`，
> 原设计的 import map + ESM 会被 CORS 拦掉——模块脚本请求带 `Origin: null`，静态服务器不回
> `Access-Control-Allow-Origin`，`vendor/vue.js` 与 `ui/vue/index.js` 全部 `net::ERR_FAILED`，白屏。
> **沙箱隔离与 ESM 只能二选一**：加 `allow-same-origin` 等于放弃隔离（用户代码能读宿主 DOM/localStorage/cookie），
> 不可接受。因此 Playground 改用**经典脚本**（`vue.global.js` + `office-ui.js` UMD），
> 与 02 §4.1「无构建器必须用含编译器的全局构建」同形。代价是沙箱内**不能**现场跑 `compiler-sfc`：
> 多文件 SFC 只能走宿主侧预编译，单文件 demo 由 `vue.global.js` 自带的模板编译器处理。

关键取舍：
- **不在沙箱内跑 `@vue/compiler-sfc`**（原计划用它支持多文件 SFC demo）。沙箱 origin 为 `null`，ESM 被 CORS 拒，
  只能退回 UMD 经典脚本；`compiler-sfc` 的多文件能力要配 ESM 才有意义。多文件 SFC 改为**宿主侧预编译**成单文件源码再注入，
  单文件 demo 直接交给 `vue.global.js` 的运行时模板编译器（同 02 §4.1 的全局构建路径）。
- **编辑器选 CodeMirror 6（MIT）而非 Monaco**。Monaco 需 worker 文件、体积大、内网部署配置繁琐；CM6 模块化、按需加载、Vue 语言支持有现成包。这是"内网可用"约束下的必然选择。
- 沙箱属性 `sandbox="allow-scripts"`，**不给** `allow-same-origin`（否则用户代码能读宿主 DOM 与 localStorage）。因此 iframe 内不能直接用 `localStorage`——通过 `postMessage` 代理一层存储请求给宿主。
- 预览区高度自适应：iframe 内用 `ResizeObserver` 持续上报 `height`，宿主同步。禁止用固定高度（长组件如 `OjRibbon` 会被截断），也不能只在挂载后上报一次——组件内部异步展开（如 Ribbon 折叠态切换）会再改高度。

### 自托管不是我们的怪癖，是主流做法

- **Element Plus 并未嵌 StackBlitz**：`docs/.vitepress/vitepress/composables/use-playground.ts` 拼的是 `https://element-plus.run/#<utoa(JSON)>`，带 `?theme=dark` 与 `?extra_packages=` 参数——**自建 SFC REPL**。五家里只有 Arco 的文档插件同时装了 `@stackblitz/sdk` 与 `codesandbox`。
- 结论：对 canvas/滚动密集的办公演示，**沙箱 iframe 是唯一诚实的选择**（WebContainers 吃 CPU，且需要外网）。

### 两种演示机制要显式分流

`vitepress-demo-plugin`（MIT，子路径导出 `./client` `./markdown` `./style.css`）在**构建期**编译 demo 并**页内渲染**。

| demo 类型 | 用哪种 | 理由 |
|---|---|---|
| 原子件：`OjIcon` `OjCommandButton` `OjTooltip` `OjNumberField` | 构建期页内渲染 | 零 iframe 开销、SSR 友好、复制即用 |
| 画布/滚动件：`OjRibbon` `OjTableGridPicker` `OjRuler` `OjGridContainer` `OjSlideCanvas` | iframe Playground | 页内渲染会让 demo 的滚动/缩放/`position: fixed` 污染文档页本身，且无法隔离全局 token |

在 demo 声明处用显式标记选择机制（`:::demo mode=iframe`），**不做自动猜测**——自动规则一旦判错，症状是"文档页滚动坏了"，很难归因到 demo。

### 首页与指南里的静态演示
不需要可编辑的场合，直接用 `<OjDemoStatic>`：构建期 SSR 渲染出 HTML 快照 + 引入真实 CSS，零运行时开销。文档站首屏性能对 SEO 与内网低配机器都关键。

---

## 4. 搜索：本地索引 + 中英日分词

选型被调研进一步验证：**VitePress 1.6.x 已把 `minisearch@^7.1.1` 与 `mark.js` 作为直接依赖内置**，并提供 `search.provider: 'local'`。也就是说本地搜索是零额外依赖、零第三方协议、零爬取申请即可用的官方能力——不需要自建索引服务。

反观 Algolia DocSearch：npm 包本身写 MIT，但**它的索引/爬取计划（DocSearch for Open Source）是另一套非代码条款**，依赖对方审批与持续抓取，内网与私有化部署场景直接不可用。因此 DocSearch 只作为公共文档站的可选增强，本地 minisearch 是唯一主路径。

```ts
// 构建期：.vitepress/build/search-index.ts
import { MiniSearch } from 'minisearch'

const index = new MiniSearch({
  fields: ['title', 'headings', 'text', 'keywords'],
  storeFields: ['title', 'path', 'anchor', 'lang', 'group'],
  tokenize: tokenizeCJK,          // ← 关键
  searchOptions: { boost: { title: 4, keywords: 3, headings: 2 }, prefix: true, fuzzy: 0.15 },
})
```

`tokenizeCJK`：对 CJK 字符区间做 **bigram 切分**（"表格选择器" → `表格 格选 选择 择器`），非 CJK 按空格/标点切分并小写化。

> **2026-10-29 实测修正**：上面这种把 `tokenize` 塞进 `themeConfig` 的写法在 VitePress 1.6 **不生效**——`themeConfig` 会被序列化成 JSON 注入客户端，函数在序列化时丢掉，构建照过但词法仍是默认分词（对产物 grep `NFKC` / `tokenize:` 一处都没有，是这么确认的）。接 bigram 只能自建搜索组件（自己 `new MiniSearch({ tokenize })` 吃 `hashmap.json`）。分词器本身已实现并被 9 条零依赖用例钉死：`docs/.vitepress/search/tokenize.ts`。

> **2026-10-30 第十三轮：已接线，不再是"待办"**。三段拼起来，构建与运行时共用同一份分词与算分规则：
> - **构建期** `scripts/build-search-index.ts` 扫 `docs/**/*.md`（排除 `srcExclude` 的 `adr/`），
>   抽 `title / headings / text`，用 `tokenizeCJK` 建 `MiniSearch` 并 `toJSON()` 到
>   `docs/public/search/index.json`（41 页 / 97 KB，入库 + `pnpm lint:docs` 字节级守新鲜度）。
> - **运行时** `theme/components/OjSearch.vue` 懒加载 `minisearch` 与索引，`MiniSearch.loadJSON` 复原；
>   `Ctrl+K` / `/` 唤起，↑↓ + `Enter` 导航，分组聚合，命中高亮。
> - **共享** `search/options.ts` 导出 `SEARCH_FIELDS / STORE_FIELDS / SEARCH_OPTIONS`，
>   构建、客户端、测试三处逐字段同一份。`loadJSON` **不会**带出 `searchOptions`，
>   三处各写一份的后果是"构建期算分一套、浏览器另一套"——这类缺陷极难归因。
>
> 覆盖内置搜索的方式值得记一笔：`app.component('VPNavBarSearch', …)` **无效**，因为
> `VPNavBar.vue` 是直接 `import VPNavBarSearch from './VPNavBarSearch.vue'`，不走全局注册。
> 可行做法是 `theme/Layout.vue` 包一层 `DefaultTheme.Layout`，把组件塞进 `nav-bar-content-before`
> 插槽（`content-body` 是 `justify-content: flex-end`，位置正好是内置搜索原本的地方），
> 同时撤掉 `themeConfig.search`（不配 provider 时内置只渲染一个空容器，`styles/search.css` 隐藏它），
> 顺带省掉内置索引与 `VPLocalSearchBox` 两个 chunk。
>
> **已知降级**：① 索引只有一份（`search/index.json`），不是 PRD 写的三语独立索引——站点目前
> 只有中文（`lang: 'zh-CN'`，无 i18n 目录），等真有 `en/` `ja/` 再按语言拆，`tokenizeCJK` 本身
> 已覆盖日文长音折叠与全半角；② 结果不给正文片段（`storeFields` 不存 `text`，否则索引翻倍），
> 只显示标题与**含查询词**的小节名。

这是中文文档搜索最常见的错误：直接用按空格分词的默认 tokenizer，导致搜"表格"命中不了"表格选择器"。bigram 方案不需要词典、不需要 wasm 分词器，索引体积约增 40%，可接受。

日文额外需要：
- 同时索引**全角与半角**形式（`１０` ↔ `10`、`ファイル` ↔ `ｶﾞｲﾙ` 半角片假名）
- 同时索引**长音折叠**形式（`サーバー` ↔ `サーバ`，用户输入两种都有）
- 假名与汉字混合词的 bigram 同样适用

三语各自建独立索引（`search-index.zh.json` / `.en.json` / `.ja.json`），按当前语言加载，避免跨语言噪声。索引懒加载：首屏不阻塞，`requestIdleCallback` 时拉取。

> **落地状态（2026-10-30）**：先是**单份** `search/index.json`——站点只有 `zh-CN` 一个语言，拆三份等于三份重复内容。
> 拆分点已经留好（构建脚本里的 `toRoute` / `toGroup` 与索引产物名分离），等 `docs/en/` `docs/ja/` 出现时按目录前缀
> 生成三份即可，客户端按 `useData().lang` 选 URL。懒加载当前是"首次打开搜索才 fetch"，比 `requestIdleCallback`
> 预取更省——文档站搜索的使用频率不值得占首屏带宽。

搜索体验要求：结果按分组（组件 / 指南 / Preset / Token）聚合、支持 `按钮` `button` `OjButton` 三种写法命中、高亮命中片段、方向键 + `Enter` 键盘导航、`/` 或 `Ctrl+K` 唤起。

---

## 5. API 表与 Token 表自动生成

用 **`vue-component-meta`**（Vue 官方 Language Tools 的一部分，MIT）从 `.vue` + `.d.ts` 提取 props / events / slots / exposed 及其类型与默认值：

```ts
const meta = checker.getComponentMeta('packages/ui/components/button/Button.vue')
// → props: [{ name:'type', type:'"primary"|"text"|…', required:false, default:'"primary"' }]
```

- 描述取自 `/** jsdoc */` 注释 → **强制要求每个 prop 有 JSDoc**，ESLint 规则卡关。
- 类型折叠显示（不展开 `HTMLAttributes` 等交叉类型），过长类型给"展开"。
- CSS 变量表：扫描组件 `style/*.css` 中的 `--oj-<comp>-*` 声明，取默认值与来源 alias。
- 四语文档共用同一份自动生成的 API 表（代码是语言无关的），只翻译描述列 → 翻译量降一个数量级。

> 为什么不用 `vue-docgen-api`：它靠解析 AST，对 `<script setup>` + 复杂泛型的支持不如官方 `vue-component-meta`（直接走 Volar 类型系统）。前者会把 `withDefaults` 的默认值解析错。

**要清楚这是超前动作，不是抄现成。** 调研确认：**五家没有一家真的从 TS 类型渲染文档 API 表**——Element Plus 的 `plugins/api-table.ts` 只是把手写的 ```api 代码块重新排版。所以这一步没有先例可参照，真实成本在 JSDoc 纪律（每个 prop 必须有 `@description`，废弃项必须有 `@deprecated`），而不是脚本本身。同一份元数据要同时喂给文档表与 `web-types.json`/`tags.json`/`attributes.json`（02 号文档 §4.1），**一份来源，两处消费**。

### 另两项低成本高回报的构建产物

1. **剥 TS 的纯 JS 示例**。照搬 TDesign 的 `script/generate-js-examples.ts` 思路：构建期用 esbuild `transform` + prettier 机械地把每个 `.vue` 示例里的 TypeScript 剥掉，生成 `_example-js/`。文档站的示例因此能提供一个"复制即可在无构建器项目里运行"的 JS 标签页。我们的目标用户 A 正是这批人，而这件事手工做不可能维持。
2. **`llms.txt` 与机器可读文档包**。Element Plus 有 `gen-llms` 构建任务。成本极低（把已有的 Markdown 与 API 元数据拼一份索引），而 AI 助手如今已是组件库的主要发现与入门渠道之一——没有它，用户的第一个问题会由一个不了解我们 API 的模型回答。

---

## 6. 国际化（需求 2）

### 6.1 分层：谁负责什么

| 层 | 负责方 | 内容 |
|---|---|---|
| 组件内置文案 | `@jitoffice/i18n` | 占位符、`确定/取消`、`{rows} × {cols} 表格`、aria-label、空状态、校验提示 |
| 视觉参数 | `@jitoffice/tokens` | 字体栈、基准字号、行高、字距（见 01 号文档 §7，`html[lang]` 驱动） |
| 业务文案 | 用户应用 | 由用户的 i18n 方案负责，我们不接管 |

**我们绝不做**：应用级 i18n 框架、翻译管理平台、语言切换 UI（只提供 API，不提供"语言下拉框"）。这是组件库 i18n 与 vue-i18n 的职责边界，越界会带来依赖冲突。

#### 6.1.1 语言包形状：五家完全不一致，必须自己定

调研发现这是五个库里**分歧最彻底**的一块，没有可以直接照抄的共识：

| 库 | 形状 | 日期引擎 | 特殊之处 |
|---|---|---|---|
| Element Plus | 每语言一个嵌套对象，`{name:'ja', el:{colorpicker:{…}}}` | 无（依赖外部） | 按**字符串路径**取值 + `{var}` 插值，取不到时回退为路径本身 |
| Arco | **`LocaleInterface` 类型化接口**，含 `formatYear/formatMonth` 等 | dayjs，**格式串存在语言包里**（`formatMonth: "YYYY 年 MM 月"`） | 类型约束最强，值得抄 |
| TDesign | 一个文件 | dayjs，**在语言包内部 `import` 并调用 `dayjs.locale()`** | 语言包 = 文案 + 日期引擎注册，副作用藏在包里 |
| ant-design-vue | **拆三包**：`locale/`、`date-picker/locale/`、`calendar/locale/` | dayjs | 用户要引三个文件才齐 |
| Naive | **三分**：`common/jaJP`、`date/jaJP`、`lang/ja-JP` 组合 | date-fns | 文案**可以是函数**（`loadingRequiredMessage: label => …`），格式用 date-fns token |

**我们的选择：一语言一对象，且这个对象不止装文案。**

```ts
export interface OjLocale {
  name: string                   // 写进 html[lang]，逐字；如 'ja-JP'
  intl: string                   // ← BCP-47 标签，驱动 Intl.* ；五家均未暴露
  label: string                  // 语言切换器显示名（用该语言自身写法），如 '日本語'
  messages: OjMessages           // 文案树
  formats: {                     // 日期/数字格式串（抄 Arco：格式属于语言，不属于组件）
    date: 'YYYY年M月D日'
    time: 'H時m分'               // 实现期补上：只给 dateTime 会让"只要时刻"的场景被迫拼日期
    dateTime: 'YYYY年M月D日 H時m分'
    weekStartsOn: 1              // 0=周日。zh-CN/ja 为 1，zh-TW/en 为 0
  }
  tokenLang: 'zh' | 'zh-TW' | 'ja'   // 指向 tokens 的语言档位名，不写字体列表
  direction: 'ltr' | 'rtl'
}
```

> **与早期设计的偏差（实现期记录）**：`fontStack` 改名 `tokenLang`。这一档决定的不只是字体栈，
> 还有基准字号、行高、字距与 `line-break`；canvas 消费方要靠 `createTokens({ lang })` 取到
> **同一层**，叫 `fontStack` 会让人以为它只管 family。

理由：
1. **切语言是一次赋值，不是三处联动**。若文案、日期格式、字体栈分别由三套机制管（EP 管文案、dayjs 管日期、CSS 管字体），切语言必然出现"文案是日文但日期是中文格式"的中间态。
2. **`intl` 标签是办公库的刚需而五家都没做**。电子表格的数字/货币/百分比格式必须走 `Intl.NumberFormat(locale)`，而它需要的正是 BCP-47 标签，不是 `'ja'` 这种短码。缺这个字段，`OjNumberField` 与单元格格式化就只能猜。
3. **`tokenLang` 只存档位名（`'ja'`），不存字体列表**。字体的事实来源仍是 01 号文档的 `html[lang|="ja"]` CSS 规则——**这样即使完全不用 JS（UMD/静态 HTML/打印样式）字体也是对的**。`LocaleProvider` 的作用只是把 `document.documentElement.lang` 设为 `locale.name`，即"JS 触发 CSS"，而不是"JS 决定字体"。这是唯一能让 token 层与 i18n 层不打架的分法。
   分法成立的唯一前提是选择器用 `|=` 而非 `=`：档位名是语系（`ja`），`name` 是完整标签（`ja-JP`），
   精确匹配两者永远接不上，整层覆写会静默失效（本仓库真实踩过，见 01 §7）。这条接缝现在由
   `internal/scripts/check-contracts.ts` 直接拿产物 CSS 的选择器与四语语言包做双向比对。
4. **按字符串路径取值 + `{var}` 插值**（抄 EP）是刻意为之：它在 UMD/无构建器环境下同样工作，不需要任何编译期步骤。类型安全靠 §6.4 的生成类型在 TS 侧补，而不是把运行时查表换成编译期宏。
5. **语言包内不得有副作用**（不 `import` 并注册 dayjs，抄 TDesign 的反面）。日期引擎由我们内置的 `Intl` 封装负责，不引入 dayjs，因此这条坑天然绕开；但规则要写明，防止未来有人往包里塞注册逻辑。

### 6.2 语言包结构

```ts
// packages/i18n/src/locales/zh-CN.ts
export default {
  oj: {
    common: {
      confirm: '确定', cancel: '取消', close: '关闭', clear: '清除',
      more: '更多', loading: '加载中', empty: '暂无数据',
      yes: '是', no: '否',
    },
    tableGridPicker: {
      label: '表格',
      size: '{rows} × {cols} 表格',
      insertDialog: '插入表格…',
      exceedMax: '超出 {max} 上限，请使用插入表格对话框',
      rows: '行数', cols: '列数',
    },
    ribbon: {
      collapse: '折叠功能区', expand: '展开功能区',
      moreCommands: '更多命令',
      keyTipsHint: '按 {key} 显示快捷键提示',
    },
    colorPicker: {
      themeColors: '主题颜色', standardColors: '标准色',
      recent: '最近使用的颜色', custom: '自定义颜色',
      noColor: '无颜色', auto: '自动', moreColors: '其他颜色…',
      eyedropper: '取色器',
    },
    fontPicker: {
      recent: '最近使用的字体', all: '全部字体',
      chinese: '中文字体', latin: '西文字体',
      notInstalled: '未安装', preview: '永字八法 AaBb',   // ← 每语言换预览样本
    },
    // …
  }
}
```

规则：
1. **key 用 camelCase 语义名，禁止用中文做 key**（中文 key 会让 diff 与检索都变成灾难）。
2. **禁止字符串拼接**。`'插入 ' + n + ' 行'` 在日语下语序与助词都不同。一律 `t('x.y', { n })`。
3. 每个 locale 文件结构必须完全一致，构建期做 **key 集合 diff**，缺失或多余即失败。禁止运行时静默回退英文——中英混排的界面比缺翻译更糟。
4. 数量/单位复数：中文/日文无复数变形，英文有。用 `Intl.PluralRules` + 按语言分支，不引入格式化库。
5. 语言包本身零依赖，不依赖 `vue-i18n`。内置约 200 行的插值解析器（支持 `{name}`、嵌套、`select`/`plural` 两种基础指令）。

   **实现期定下来的文法边界**（`packages/i18n/src/message.ts`）：
   - 递归下降解析，**不用正则切分**——嵌套分支与转义在正则下无法可靠判定。
   - 支持 `{name}`、`{n, plural, =1 {…} one {…} other {…}}`、`{x, select, k {…} other {…}}`，分支体可再嵌套槽位。
   - `#` 只在 `plural` 分支内展开为计数，值由上一层显式传入，不用隐式全局状态。
   - `{{` / `}}` 是字面量大括号转义，**仅在最外层生效**：分支内的单个 `}` 必须能闭合分支，
     两条规则若同时存在，`…other {Up to # characters}}` 就永远闭合不了。
   - `plural` 必须带 `other`，缺失在**构造期抛错**，不留到界面变空白。
   - `NaN` / `Infinity` 不进 `Intl.PluralRules`（会抛），直接落 `other`。
   - **不做** ICU 的序数（`ordinal`）、性别指令、`@plurals` 别名与复数规则自定义 —— 中英日三语用不到，
     而每多一条语法就多一份四语一致的维护成本。

### 6.3 API

**框架无关运行时（已落地，`packages/i18n/src/store.ts`）** —— jQuery、UMD `<script>`、Node/SSR 直接用这一层。
语言包**各占一条子路径**，不从根入口汇出：只用中文的宿主不该白白付另外三语的体积，而 CJS/UMD 消费方
没有 tree-shaking，汇出桶就是三份硬塞进包的文案。

```ts
import { createI18n } from '@jitoffice/i18n'
import zhCN from '@jitoffice/i18n/locales/zh-CN'
import jaJP from '@jitoffice/i18n/locales/ja-JP'
import enUS from '@jitoffice/i18n/locales/en-US'

const i18n = createI18n({ locale: 'ja-JP', locales: [zhCN, enUS, jaJP], dev: true })

i18n.t('oj.tableGridPicker.size', { rows: 3, cols: 5 })   // key 与占位符都受生成类型约束
i18n.translate('yourApp.toolbar.export', { n: 2 })        // 业务文案同一条路径，未命中原样返回 key
i18n.resolve('设置单元格格式')                              // 命令注册表的适配器：裸文案透传
i18n.number.decimal(1234.5)                                // 1,234.5；委托 Intl，不自己实现
i18n.number.currency(1235, 'JPY')                          // ja: ￥1,235（全角）· en/zh: ¥1,235（半角）
i18n.date.date(new Date())                                 // ja: 2026年10月9日
i18n.date.pattern('YYYY-MM-DD', d)                         // 格式来自列定义时用这条
i18n.date.weekday(new Date(), 'short')                     // ja: 金 · en: Fri · zh: 周五
i18n.date.weekStartsOn                                     // 随当前语言变，是 getter 不是快照
i18n.use('zh-CN')                                          // 未知 name 抛错，不静默回退英文
const off = i18n.subscribe((locale) => redraw(locale))     // 框架层与 canvas 层都挂这里
```

日期方言是 **day.js 的子集**（`YYYY YY MM M DD D HH H hh h mm m ss s A a` 与 `'字面量'`），
不实现周序号（day.js 的 `W/WW`）、era（`N`）与时间戳（`X`）。**星期名不是 pattern token**，
只能调 `date.weekday()`：day.js 里 `W/WW` 是周序号、`dd/ddd/dddd` 才是星期，把 `W` 塞进格式串
会让每个熟悉 day.js 的贡献者都读错它——写 `W` 得到的就是字面量 `W`，比给出错误的数字安全。

**Vue 层（待落地，需要 `node_modules` 与 Vue）** —— 只是运行时之上的 `provide/inject` 适配，
取值语义完全由上面的运行时决定，嵌套 Provider 覆盖的是"注入哪一份 i18n 实例"：

```ts
import { createJitOffice, zhCN, enUS, jaJP } from '@jitoffice/ui'

app.use(createJitOffice({
  locale: jaJP,
  locales: { jaJP, enUS },        // 允许同时挂多语言（语言切换器）
  namespace: 'oj',                 // class/变量前缀，默认 oj
  density: 'compact',
  theme: 'light',
}))

// 组件内
const { t, lang, numberFormat, dateFormat } = useLocale()
t('oj.tableGridPicker.size', { rows: 3, cols: 5 })
numberFormat.decimal(1234.5)       // 1,234.5 → Intl 委托，不自己实现
dateFormat.date(new Date())        // ja: 2026年10月9日

// 局部覆盖：嵌套 provider，只影响子树
<OjLocaleProvider :locale="enUS"> … </OjLocaleProvider>
```

`useLocale()` 通过 `inject` 取值，因此**必须支持嵌套 Provider**（文档站本身是多语言页，内部示例可能固定英文）。

### 6.4 类型安全

构建期从语言包生成**两张表**（`packages/i18n/src/generated/keys.ts`，`pnpm i18n:gen` 产出）：

```ts
export type IntlKey = 'oj.common.confirm' | 'oj.tableGridPicker.size' | /* … */
export interface IntlValues { 'oj.tableGridPicker.size': { rows: OjMessageValue; cols: OjMessageValue } }
function t<K extends IntlKey>(key: K, values?: MessageValues<K>): string
```

写错 key 直接编译报错；有占位符的 key 少传、传错名、传进 `IntlValues` 里没有的键，同样编译报错。
这是"三语长期不腐化"的唯一可行防线——没有类型约束，半年后必然出现一堆只有中文的 key。

两条实现期的关键取舍：

- **占位符类型取全部语言的并集，不是只看源语言。** 英文的 `maxLength` 带 `{max, plural}` 而中文不带，
  只看 `zh-CN.ts` 会把这个槽位从 `number` 放宽成 `string | number`，于是 `t('…', { max: '3' })`
  在英文下依赖 `Intl.PluralRules` 的写法就没了约束。`plural` 分支的槽位一律判成 `number`。
- **表里没有占位符的 key 落到 `Record<string, never>`**，传任何值都报错，而不是"随便传、运行时忽略"。

数量说明：M0 现在是 **41 个 key**（种子组件的文案面），文档里早先写的"约 800 个"是完整组件
铺开后的量级，不要当现状读。新鲜度与四语一致性（key 集合 diff + 逐 key 占位符名集合比对）
由 `internal/scripts/check-contracts.ts` 守住，测试里另有一份"生成表与磁盘产物同源"的断言。

### 6.5 日文本地化细节（易漏项）

| 项 | 要求 |
|---|---|
| 字体栈 | `Yu Gothic UI, Hiragino Kaku Gothic ProN, Noto Sans JP, Meiryo`（顺序有因，见 01 号文档 §7） |
| 基准字号 | 同视觉尺寸下假名显小 → `--oj-fs-14` 实落 13px |
| 行高 | `--oj-lh-normal: 1.5715`（JIS 惯例）、`--oj-lh-loose: 1.75`；日文笔画密、浊点易糊 |
| 换行 | `line-break: strict` —— 禁止 `。、』` 出现在行首 |
| 标点 | 读点 `、` 句点 `。`（非中文的 `，` `。`）；引号 `「」` 优先于 `“”` |
| 敬语 | UI 按钮用**敬体简体**（`設定する` 而非 `設定してください`），标题用名词形（`テーブルの挿入`） |
| 术语 | 文档=文書、表格=表、批注=コメント、修订=変更履歴、页眉=ヘッダー、缩进=インデント、加粗=太字、底纹=塗りつぶし |
| 快捷键显示 | Mac 显示 `⌘`，Win 显示 `Ctrl`；日文界面保留英文键名（`Ctrl+C` 而非 `コントロール+C`） |
| 日期 | `2026年10月9日`，和历（令和8年）作为可选项，**不默认启用** |
| 全角输入 | IME 全角数字 `１２３` 必须在 `OjNumberField` 中被接受并归一化为半角 |

### 6.6 文档站的多语言

```
/            →  按 Accept-Language 重定向到默认语言
/zh-cn/  /en/  /ja/
```

- VitePress `locales` 配置驱动，导航/侧栏/搜索占位符全部走 locale。
- **代码示例不翻译**（注释翻译会让复制粘贴的代码带噪声）；只翻译正文与 API 描述列。
- 语言切换器保留用户当前所在页面路径（`/zh-cn/components/button` ↔ `/ja/components/button`），缺失译文时**显示英文页并在顶部提示**，而不是 404。
- 翻译流程：中文为源语言 → 提取待译 key 清单（构建期生成 `i18n/pending.md`）→ 人工/AI 翻译 → PR 回补。禁止机翻直接上线（日文办公用户对机翻敬语极敏感，会直接损害"企业级"印象）。
