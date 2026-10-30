# 贡献指南

**先说清现状**：仓库处于 M0（地基）。已有代码只有三个包 —— `packages/tokens`、`packages/shared`、
`packages/i18n`；`ui`、`icons`、文档站与 Playground 尚未开工。设计事实来源是 `prd/` 下那 6 份文档，
决策留痕在 `docs/adr/`。本文件里的约束绝大多数不是风格偏好，而是**门禁会失败**或**半年后会变成烂账**的东西。

## 0. 动手之前

1. 读 [`prd/README.md`](./prd/README.md) 的索引与开放问题。
2. 读 [`docs/adr/README.md`](./docs/adr/README.md) —— 尤其是这条判据：
   **不接受"某大库也这么做"作为唯一依据**，每条决策必须给出本项目特有的理由（办公场景约束、内网部署约束、
   canvas 渲染约束，或实测数据）。
3. 涉及第三方代码或资产时读 [`NOTICE`](./NOTICE)。许可白名单是 CI 强制的，不是约定。

## 1. 环境

| 项 | 要求 | 为什么 |
|---|---|---|
| Node | `>=24` | 测试与生成脚本靠 **Node 的原生类型剥离**直接跑 `.ts`，不经构建 |
| pnpm | 12（`packageManager: pnpm@12.5.1`） | workspace + `catalog:` 统一版本 |

**关键约束**：门禁脚本必须在**没有 `node_modules`** 的环境下也能跑。信创/内网/离线环境是本项目的第一类
使用场景，"先装依赖才能检查"等于没有检查。所以 `internal/scripts/` 与 `packages/*/scripts/` 里
**只允许 `node:*` 内置模块**，不要引入第三方包，哪怕它只是一个小工具。

`internal/build/` 是这条规则**故意排除在外**的另一条链：它的职责是重建产物，本来就离不开 vite。
它可以引第三方依赖，代价是它的任何检查都不许混进 `pnpm verify`——一旦进去，离线环境的那条链就废了。

## 2. 提交前先跑

```bash
pnpm verify   # = tokens:gen → i18n:gen → node --test "packages/*/test/**/*.test.ts" → check-contracts
```

Windows 开发机不需要为 git 做任何配置：`.gitattributes` 把全仓钉成 LF。
这条是为这个仓库定制的——`packages/*/dist/**` 是**入库的生成物**（tokens 的 CSS/JS、shared 与 i18n 的
四套产物链），而门禁把它们与生成器/构建器的输出**逐字节**比较；若按 `core.autocrlf=true`
（Windows 上 git 安装程序的默认值）检出成 CRLF，`pnpm verify` 会在每个 Windows 克隆上报 `dist 已过期`，
而 Linux CI 永远是绿的。
已实测：手工把 `dist/index.css` 换成 CRLF，`pnpm lint` 立刻红。

单独跑：

- `pnpm test:node` —— 零依赖单测（`node --test`，当前 211 例，分布在 tokens / i18n / shared / ui /
  docs 各自的 `test/` 下；其中一部分加载的是 `dist` 而不是 `src`。
  这个数字会随 PR 漂，以运行输出的 `ℹ tests` 行为准）。
- `pnpm test:unit` —— Vue 层单测（Vitest + happy-dom），**自带 `--coverage`**：
  `src/vue/**` 行 ≥85%、`registry.ts` 与 `popper.ts` 行 ≥95%，差一个点就红。
  这三条阈值不是"追数字"：补的是弹层/树/框选/签名板这类真有分支的组件。
- `pnpm lint` —— `internal/scripts/check-contracts.ts` 的结构性契约。
- `pnpm lint:package` —— 真打五个发布包的 tarball，查协议解析、`files` 漏入口、源码/测试泄漏。
- `pnpm lint:types` —— 用 `attw` 按 node10 / node16-CJS / node16-ESM / bundler 四种解析模式
  检查类型出口。`tsc --noEmit` 只在自己的树上做一次解析，看不见"`.d.ts` 混进 `require` 分支"这类
  双模式错位（现象是 `Masquerading as ESM`，node16 + commonjs 的消费者装上即报错）。
- `pnpm lint:license` —— 生产依赖树的许可白名单（零依赖，只读 `node_modules` 里真实的包）。
- `pnpm lint:css-magic` —— 字号与时延不许写字面量（`font-size: 12px` / `transition: 150ms ease`），
  必须走 `var(--oj-fs-*)` / `var(--oj-motion-*)`。例外逐条登记在选择器上，且例外失效会被报出来。
  间距与圆角暂不查：token 标度覆盖不了 2px / 7px / 28px / 56px，先定标度再收紧。
- `pnpm lint:artifact-offline` —— 扫五个发布包的 `dist`，只拦**会发起请求**的外链（CSS `url()`/
  `@import`、HTML/SVG 的 `src`/`href`/`srcset`）。内网/离线环境下这类请求不报错，只是让首屏挂着
  等超时；`svg xmlns` 与报错文案里的 URL 不算。
- `pnpm tokens:gen` / `pnpm i18n:gen` —— 重新生成产物与类型表。
- `pnpm build` —— turbo 跑三包构建；`pnpm build:check` —— 把源码重建进临时目录与入库 `dist`
  逐字节比对，再用 `es-check es2018` 扫兼容线产物。**这两条要 `node_modules`**，所以不在 `pnpm verify` 里。

`pnpm lint` 抓的是结构，不是风格：发布包 `dependencies` 必须为空、发射样式的包不得标
`sideEffects: false`、`exports` 指向的文件必须真实存在、`exports` 不许指回 `./src/*.ts`（源码直出的包
发出去，下游得自己装 TypeScript 才能用）、入库 `dist` 里每份 `.d.ts` 的相对说明符都必须能在产物树里
解析到（类型面断链是静默的，`tsc --noEmit` 在自己的树上查不出来）、`main`/`module`/`types` 必须逐字等于
`exports["."]` 的 `require`/`import`/`types` 目标（对侧条件存在却**没写**这个字段同样违反），有 `dist/umd`
产物就必须声明 `unpkg`/`jsdelivr` 并指向其中的文件——webpack4、Jest、`<script>` 直连 CDN 裸包名的用户
先命中这几个字段，而 `exports` 的用例与检查全都看不见它们；只改一张脸的结果是新打包器绿、老消费方红、
CDN 上那个 UMD 白构建一场。此外还查：tokens 与 i18n 的产物必须与源码同源、
框架无关包的根入口不得把 `vue` 拖进模块图、语言档位与 `html[lang|="…"]` 层的双向比对（变量覆写层与
元素级排版层都要命中内置语言，且产物里禁止出现 `[lang=` 精确匹配），
以及 README / 治理文件 / ADR / `prd` 这 20 份文档里的**内部链接必须真实存在**。
最后一条**区分大小写**：开发机（NTFS、APFS）默认大小写不敏感，`docs/adr/Readme.md` 这种写法
在 `existsSync` 下会通过，到 Linux CI 才炸，所以脚本逐级用 `readdirSync` 比对真实目录项。

> `pnpm verify` 刻意不含 `typecheck` 与 `build:check`：前一条链零依赖就能跑（装不上包也能验证产物与契约），
> 而 `tsc` 与 vite 构建需要 `node_modules`。推 PR 前请都跑一遍：
> `pnpm verify && pnpm typecheck && pnpm test:unit && pnpm build:check && pnpm lint:css-magic && pnpm lint:package && pnpm lint:types && pnpm lint:license && pnpm lint:artifact-offline`。
> 这几条都要 `node_modules`（要打包、要读真实依赖、要跑 Vitest），所以也不进 `verify`。
> 尚未落地、因此**本地跑不了**的：ESLint / Stylelint 的间距与字号魔法数（颜色已由契约 13 拦下），
> `packages/ui` 的 SFC 链（当前组件一律渲染函数，仓库里 `.vue` 文件数为 0）。
> 它们属于 A2/A3，验收状态见 [`prd/05-m0-delivery-plan.md`](./prd/05-m0-delivery-plan.md)；
> 别在 PR 里写"lint 已过"来指代它们。
>
> 视觉与交互用例走另一条链，**按文件名分 runner**：`*.test.ts` 归 `node --test`（零依赖），
> `*.spec.ts` 归 Playwright（`packages/tokens/test/visual/`，跑法
> `pnpm --filter @jitoffice/tokens test:visual`）。后者需要浏览器，所以既不在 `pnpm verify` 里
> 也不进 turbo 缓存——排版结果取决于那台机器的内核与字体。别把要浏览器的断言写进 `.test.ts`，它跑不起来。
> 拿不到 `cdn.playwright.dev`（内网、或下载停在 10% 的机器）时，用本机已装的内核跑：
> `OJ_BROWSER_CHANNEL=chrome`（或 `msedge`）`pnpm --filter @jitoffice/tokens test:visual`，
> 前提是内核 ≥ ADR-0002 的基线——低版本上跑出来的降级行为正是我们要防的，那不是"通过"。
>
> 写这类用例有一条容易踩的坑：**要锁我们发出去的 CSS，被测值就必须来自继承或选择器命中**。
> 在测试自建的盒子上 `setProperty` 被测属性，内联样式压过 `body` 的继承值，量的是 UA 而不是产物，
> 产物改成什么它都绿（2026-10-09 首跑就是这么被蒙过去的，见 `prd/05` 偏差 13）。
> 显式设值只允许出现在对照组里，并且每条锁都要真把产物那一行改掉或删掉，确认它会红。

## 3. TypeScript 写法

`tsconfig.base.json` 的开关不是装饰，每一条都会让某类代码写不出来：

| 开关 | 你必须怎么写 |
|---|---|
| `verbatimModuleSyntax` + `isolatedModules` | 只要类型就写 `import type`，混着写会报错 |
| `erasableSyntaxOnly` | **不能用** `enum`、`namespace`、构造函数参数属性；用 `as const` 对象 + 联合字面量类型 |
| `noUncheckedIndexedAccess` | 数组下标与 `Record` 取值结果是 `T | undefined`，先判空（`noUncheckedIndexedAccess` 抓到的多数是真 bug） |
| `exactOptionalPropertyTypes` | 可选属性**不能**赋 `undefined`；要么不传这个键，要么把类型写成 `?: T | undefined` |
| `noImplicitOverride` / `noFallthroughCasesInSwitch` / `useUnknownInCatchVariables` | `catch (e)` 之后要收窄类型，别直接 `String(e)` 当成 Error |

**API 可用性看运行时基线，不看 `target`。** `target: ES2022` + `lib: ES2023` 让 `tsc` 放行
`Object.hasOwn`、`Array.prototype.at`、`structuredClone`、`Object.groupBy` —— 但它们里有些落在
候选浏览器基线（Chromium 86 / Firefox ESR 78，ADR-0002 尚未定案）之外，而类型检查**不会告诉你**。
基线内核每次取文案都在跑的路径上尤其致命（例如 `hasOwnProperty` 的写法，见 `packages/i18n/src/store.ts`）。
要用较新的 API，先在 PR 描述里给出目标内核的最低版本证据。

**块注释里不要写 glob。** `internal/scripts` 与两个生成器都靠 Node 的 type stripping 直接执行，
而 `packages/*/dist` 这种写法里的 `*/` 会**提前闭合注释**，剩下的中文散文被当成代码解析，
报出来是 `ERR_INVALID_TYPESCRIPT_SYNTAX` 指向注释中部——很难一眼看出原因。写 `packages/<name>/dist`。

## 4. 命名与样式

- 组件 `Oj` 前缀、CSS 变量 `--oj-*`、class 用 BEM `oj-`。**命名空间已写死在产物里**，改动必须开 ADR。
- CSS 里**不许出现魔法数**：颜色、字号、间距、时延一律取 token。stylelint 门禁会在 A3 落地后拒绝
  `color: #fff` 这类字面量。
- 每个组件必须有独立 `index.ts`，`components/index.ts` 只做 re-export、不写任何逻辑。
  在聚合入口写 `const install = ...` 会让整棵 tree-shaking 失效。
- 语言相关选择器一律 `|=`（`html[lang|="ja"]`），不许用 `=`。理由与被修过的真实缺陷见
  [`prd/01-design-tokens.md` §7](./prd/01-design-tokens.md)。`not()` 里同理，产物里出现 `[lang=` 会被门禁直接拒。
- **业务图标不许改 `packages/ui/src/icons.ts`**：那是内置三十枚的常量表，改了下一次生成/升级会被冲掉。
  用根入口的 `registerIcon(name, markup)`（或 `registerIcons({...})`）在应用启动时注册，
  `OjIcon` 的查表会优先命中；名字必须是 kebab-case 且不能占 `oj-*`（内置命名空间）。
  校验在注册期完成：缺 `viewBox`、多个根 `<svg>`、内联事件、`<script>`、`javascript:`、外链一律抛错——
  组件用 `innerHTML` 渲染，放过一条就是注入面。

## 5. 改 token

1. 改**原始数值**只改 `packages/tokens/src/seed.ts`（色相、饱和度、间距基数这些种子值）；
   改**变量表与覆写**改 `packages/tokens/src/tokens.ts` 的注册表，那里才是暗色 / 紧凑 / 语言三档的写法。
2. 跑 `pnpm tokens:gen`，它发射 6 个产物，**`dist/index.d.ts` 也在其中**：新增或改名一个注册路径，
   `OjTokens` 里对应的成员会自动出现或消失，因此**不要手改 `dist/`** —— 那是入库的生成产物，
   改一次就漂移一次；`d.ts` 与注册表不一致时 `parity` 的"类型产物同源"用例会直接指出多的和缺的。
3. 结构门禁会拒绝"`light` 写成十六进制却没有 `dark`"的条目。这不是刁难：`--oj-text-danger`
   曾因缺 `dark` 在暗色下静默掉到 3.90:1。
4. 暗色覆写只写**真正变化**的变量，色板按索引镜像；`parity` 测试会复刻 CSS 级联顺序逐组合比对，
   所以覆写层的**书写顺序**（dark < compact < lang）也是契约的一部分。
5. **例外：`generate.ts` 的 `resetSection()`** 是 tokens 产物里唯一碰元素的选择器
   （`html[lang|="ja"] body` 的 `line-break` 这类）。它们不是可取值的 token，不进注册表，
   所以 JS 产物与 `tokenNames` 里没有对应项，由 `typography.test.ts` 与门禁 8 守住，
   改错了 `parity` 是抓不到的。

## 6. 改文案 / 加语言（i18n）

- **先加到源语言 `zh-CN`，再补齐 `zh-TW`、`ja-JP`、`en-US`**，然后跑 `pnpm i18n:gen`。
  四语的 key 集合与**每个 key 的占位符名集合**必须完全一致，否则门禁直接失败。
- 禁止字符串拼接：`'插入 ' + n + ' 行'` 在日语下语序和助词都不对。一律 `t(key, values)`。
- `plural` 分支**必须带 `other`**，缺了会在构造期抛错，不会留到界面空白。
- **日文译文必须经母语者复核才能合入**（标签 `native-review`）。机翻直接上线会损害"企业级"定位，
  敬体规则与术语表见 [`prd/04-docs-site-and-i18n.md` §6.5](./prd/04-docs-site-and-i18n.md)。
- 语言包**只放数据**：不 `import` 并注册日期库、不改 `document`、不做任何副作用。副作用属于 Vue 层的
  `OjLocaleProvider`（尚未落地）。
- 新增语言请用**每语言一条子路径**（`@jitoffice/i18n/locales/xx-YY`），不要往根入口汇。

## 7. 加图标

| 项 | 要求 |
|---|---|
| 源 | `packages/icons/svg/{name}.svg`，24×24 网格、1.5px 描边、`fill="currentColor"` |
| 许可 | **必须自绘**。不接受第三方图标集混入 —— 许可审计面与字体分发限制见 `NOTICE` |
| 形式 | 只发 SVG：Vue 组件（tree-shakable）+ `sprite.svg`（`<use>`）+ `icons.ts` 常量（canvas 要原始 path）。**不发图标字体** |
| 禁止 | `<image>`、`<filter>` 等位图依赖；SVGO 配置不得移除 `viewBox` 或改写 `fill` |
| 验收 | 16px 下肉眼可辨；`<use href="#oj-…">` 在无构建器页面能渲染；单图标打包 ≤ 1 KB gzip |

## 8. 什么时候必须开 ADR

满足任一条就得写（模板 `docs/adr/_template.md`，判据全文见 `docs/adr/README.md`）：

1. 改变 `--oj-*` 变量命名规则或 class 命名规则
2. 改变包的划分、依赖方向，或新增/移除运行时依赖
3. 改变构建产物格式、`exports` 映射或 `sideEffects` 判定
4. 改变支持的浏览器范围
5. 与 `prd/` 既有结论**相反**的任何决定
6. 引入第三方代码或资产（同时触发 `NOTICE` 更新）

不需要 ADR：新增一个组件（走 PR + 组件清单更新）、不改公开契约的内部重构、修 bug。

## 9. 变更集与 PR

- 影响任一发布包**公共行为**的 PR 必须附 changeset，内容写"使用方能感知的变化"，不要写改了哪个文件。
  纯内部重构与文档可以在 PR 描述里说明理由后跳过。

  ```bash
  pnpm changeset   # 选包 → 选 patch/minor/major → 写一段使用方能读到的话
  ```

  门禁已经接上了：`internal/scripts/check-changeset.ts` 在 CI 里检查
  "改了 `packages/{ui,icons,tokens,i18n,shared}/src/**` 或包清单，却没新增 `.changeset/*.md`"，
  缺了直接红（测试、dist、文档站的改动不强制）。本地可以 `pnpm lint:changeset` 自查，
  没有 `origin/main` 时脚本会说明原因并跳过，不会假红。
- 发布是两段式：合并进 `main` 后由 `release.yml` 开一个 **Version Packages PR**（版本号 + CHANGELOG 的 diff），
  合并它才真正 `npm publish`。所以 changeset 里那段话最终会原样出现在 CHANGELOG 与 Version PR 里——
  写的时候就想清楚"三个月后别人在 changelog 里读到这句，知不知道要不要升级"。
- 提交信息用 Conventional Commits（`feat:` / `fix:` / `perf:` / `refactor:` / `docs:`）。
- 一个 PR 只动一条契约。同时改 token 生成器、消息文法和构建配置的 PR 无法 review，也无法回滚。
- 涉及视觉的改动必须附**三语对照截图**（简中 / 繁中 / 日文）与键盘操作说明；只有英文截图的视觉 PR 会被要求补。

## 10. 沟通与安全

- 行为准则：[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)。
- 无障碍缺陷请走**独立模板**（a11y），不要当普通 bug 提 —— 这类报告混在普通队列里很容易被淹没。
- 安全漏洞请走 [`SECURITY.md`](./SECURITY.md) 的私密渠道，**不要开公开 issue**。
- 版本支持范围见 [`SUPPORT.md`](./SUPPORT.md)；提"能不能顺手支持一下旧版本"之前先看它。
