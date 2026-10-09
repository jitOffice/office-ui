# 产品定位与边界

## 1. 一句话

**面向 Office/WPS 类场景的 Vue 3 组件层——填补"通用组件库"与"文档引擎"之间的空白，让开发者用一套 Ribbon、选择器、面板、画布外壳，快速搭出任意一种办公应用。**

`office-ui` 不做文档引擎，也不做后台管理系统。它做的是**所有办公应用都要重写一遍的那层交互外壳**。

---

## 2. 为什么这个位置是空的

把现有方案按"离业务代码的距离"排开：

```
后台管理系统          办公交互外壳        文档/表格/演示引擎
Element Plus    ←→   【空白区】     ←→   Univer / OnlyOffice
Arco Design Vue                          JitWord / WPS Web
Naive UI
TDesign
```

- **通用组件库**为"表单 + 列表 + 弹窗"设计。它的 Button 假设高度 32、hover 有背景、点击有涟漪；而 Ribbon 里的按钮要求 24px、图标主导、按下后保持 active、Tooltip 必须 400ms 延迟且可键盘唤出。**这些差异无法靠 theme 配置弥合**，只能改组件本身。所以拿 Element Plus 做 Office 应用，最后会写出几百行 `:deep()` 覆盖样式——比自研更贵。
- **文档引擎**（Univer / OnlyOffice）自带完整 UI，但那是**它的地盘**：你替换不了它的工具栏，只能整体嵌入或 fork。想在引擎之上做定制交互，就必然需要一层自己的组件。
- 中间的空白区正是所有办公应用的共同需求：**Ribbon/命令栏、网格化选择器、颜色与字体拾取、标尺与缩放、批注与审阅面板、版本历史、模板库、协同头像、命令面板**。它们既不属于后台组件，也不属于引擎内核。

`office-ui` 只做这一段，做到企业级完成度。这是能长期成立的定位——**不跟通用库抢表单，不跟引擎抢排版内核**。

---

## 3. 目标用户与 JTBD

| 用户 | 场景 | 待完成任务 | 关键约束 |
|---|---|---|---|
| **A. 业务系统集成商**（主力） | 在 OA/ERP/合同/公文系统里嵌入"类 Word"编辑体验 | 用最少代码拼出一个能改格式、能插入表格、能批注的编辑器外壳 | 存量项目可能是 jQuery/无构建器；必须能 `<script>` 直用 |
| **B. SaaS 办公产品团队** | 自研在线文档/表格/白板 | 不重复造 Ribbon、选区、下拉浮层这些"人人都要写一遍"的轮子 | 包体敏感，要求按需引入；要能深度定制品牌色 |
| **C. 国产化/私有化交付团队** | 政企内网交付 | 在信创环境（麒麟/统信 + 国产浏览器）跑通，且无授权风险 | 字体、图标、依赖必须全部可商用；不能依赖外网 CDN |

用户 A 与 B 的需求冲突点在于 **A 要"开箱即用一整页"、B 要"只给我三颗螺丝"**。用分层解决：L1 组件独立可用、零互相依赖；同时提供 `@jitoffice/preset-*` 整页模板满足 A。

---

## 4. 边界矩阵

必须精确到"谁互补、谁冲突"，否则社区第一个 issue 就是"你这跟 X 有什么区别"。

| 项目 | 许可 | 关系 | 说明 |
|---|---|---|---|
| Element Plus | MIT | **互补** | 我们不做 Form/Table/DatePicker/Descriptions。官方给出共存指南，且 token 命名对齐，便于同页使用 |
| Arco Design Vue | MIT | **互补**（且视觉最近） | 主色同为 `#165DFF`。定位同上，不做其已覆盖的通用件 |
| TDesign Vue Next | MIT | 互补 | 同上 |
| Naive UI | MIT | 互补 | 同上 |
| Univer | Apache-2.0 | **互补，非竞争** | 它提供 sheets/docs/slide 内核。我们的 `@jitoffice/grid-picker`、`Ribbon` 可直接驱动它的命令系统。提供官方 adapter |
| OnlyOffice Document Server | **AGPL-3.0** | **冲突风险，明确不支持** | AGPL 具有传染性，二次修改需开源整个服务。文档中不提供"改造 OnlyOffice"路径，只允许 iframe 级嵌入且由用户自担许可 |
| CKEditor 5 | GPL-2.0+ / 商业双授权 | **不集成** | 常见商用踩坑点。我们只定义编辑器无关的 Toolbar/命令契约，不绑定任何富文本内核 |
| TinyMCE | LGPL-2.1+ / 商业 | 不集成 | 同上 |
| TipTap / ProseMirror | MIT | **推荐搭配** | L2 文档外壳提供可选的 ProseMirror 命令桥 |
| SheetJS `xlsx` | 自定义（部分版本商业） | **不捆绑** | 导入导出由用户自选，我们只给 UI 与事件契约 |
| Luckysheet | MIT（已停维） | 不集成 | 其团队已转向 Univer |

**许可红线**（对应需求 6"商用无风险"）：

先确认一个事实：**五个主流 Vue 3 库全部是 MIT**（`element-plus` `@arco-design/web-vue` `naive-ui` `tdesign-vue-next` `ant-design-vue` 的 registry `license` 字段均已核验），核心工具链里唯一的 Apache-2.0 是 **TypeScript 本身**（Vue/Vite/Rollup/Sass/Turbo 皆 MIT）。我们选 Apache-2.0 依然正确——它带专利授权条款，且单向吸收 MIT 依赖。但代价是**必须附 `NOTICE` 文件**并列明所有上游版权与许可，这是 MIT 背景团队最常漏的一项合规义务。

1. 全部直接依赖必须为 MIT / Apache-2.0 / BSD / ISC / OFL。CI 用 `license-checker --onlyAllow` 卡关，出现 `GPL/AGPL/LGPL/SSPL/CC-BY-NC/CC-BY-SA/自定义` 即构建失败。
2. **图标必须自绘，且只发 SVG 组件，绝不发图标字体。** 图标字体（TTF/WOFF）会在编译期**静默合并**各字形的原始许可（CC-BY / Apache / OFL 混在一个二进制里），且许可文件在打包时通常被丢弃——授权链彻底断裂。同理禁止从 iconfont.cn 拉取他人上传图标（授权不可追溯）。另：不得复用 Microsoft Office 的图标、字体或可识别的界面元素，Office 的图标与界面受微软商标与版权保护，这是国产办公组件最容易吃官司的地方。
3. **表情/旗帜类资产是隐藏雷区。** `openmoji` 是 **CC-BY-SA-4.0**，其 share-alike 条款与 Apache-2.0 结合作品**不兼容**，禁止使用；`twemoji` 的代码是 MIT 但**资产是 CC-BY-4.0**，需显式署名；`@fortawesome/fontawesome-free` 的许可是 `(CC-BY-4.0 AND OFL-1.1 AND MIT)` 复合体。默认策略：符号类一律用 Unicode 文本 + 字体渲染，不引入表情图形资产包。
4. **字体**只允许捆绑 OFL/Apache 许可（Inter、Noto Sans SC/JP、Source Han Sans/Serif、JetBrains Mono、Sarasa Gothic）。`Microsoft YaHei`/`微软雅黑`、`Yu Gothic`、`PingFang SC` 属**仅限本地名称引用**——写进 `font-family` 字符串不构成再分发，打包其字体文件即侵权。
5. **设计稿导出物是演绎作品（derivative work）。** 本库默认主题参照 JitWord/JitKnow 界面，需取得设计方的**书面权属/授权确认**并归档到 `docs/legal/`，然后才能发布默认主题。参照他人 UI 的"风格"是安全的，直接复用其导出的 SVG/PNG 资产不是。
6. 文档站截图、演示数据、模板样例不得含真实企业名、商标、可识别的 Office 界面。
7. 若复制 MIT/Apache 上游的代码片段（允许，且方向兼容），必须保留原始版权声明并记入 `NOTICE`。

---

## 5. 分层承诺

```
@jitoffice/tokens      Seed/Alias/Component 三层设计变量，双产物（CSS + JS）
@jitoffice/icons       自绘办公图标，仅 SVG 源 → Vue 组件（tree-shakable）+ sprite.svg（`<use>`）+ JS 常量（canvas）
@jitoffice/ui          L1 办公交互外壳 —— 本库的主体，零重依赖
@jitoffice/i18n        zh-CN / zh-TW / ja-JP / en-US 语言包（每语言一条子路径）+ 零框架取值运行时；LocaleProvider 在 @jitoffice/ui
────────────────────────────────────────────────────────────
@jitoffice/docs-shell  L2 文档编辑器外壳（标尺/页面/缩放/批注槽）
@jitoffice/sheet-shell L2 表格外壳（网格容器/公式栏/选区/冻结）
@jitoffice/slide-shell L2 演示外壳（画布/图层/缩略图/放映）
@jitoffice/preset-*    整页模板：合同审阅、公文排版、多维表格、知识库
```

**依赖方向单向向下，L1 永不依赖 L2。** 只用 L1 的用户不应被拖进任何 canvas/CRDT 代码。

L1 的硬承诺（可验证，写进测试）：

- 单个组件 gzip 后 ≤ 6 KB（图标包除外）；`@jitoffice/ui` 全量 gzip ≤ 90 KB。
- 零运行时依赖（Vue 为 peer）。允许捆绑的极小工具：无。
- 每个组件可独立 `import { OjButton } from '@jitoffice/ui'` 且样式自动跟随，无 `import 'xxx/style/css'` 心智负担。
- 不依赖任何通用组件库。用户可与 Element Plus 共存，但我们不 require。

---

## 6. 非目标（同样重要）

不做，且不接受"顺手加一下"的 PR：

1. **不做通用后台组件**：Form 校验引擎、Table 排序分页、DatePicker 面板、Transfer、Descriptions——用 Element Plus/Arco。我们只做它们没有的办公件。
2. **不做富文本排版内核**：不实现 docx 解析、分页、字体度量、协同 CRDT。L2 是"外壳 + 契约"，引擎由用户或 Univer/ProseMirror 提供。
3. **不做后端/SDK 服务**：不提供文件转换、权限服务、协同服务器。
4. **不做 React / Svelte / Angular 版本**。Vue 3 单栈，把工程量投在深度而非广度。
5. **不做小程序**：办公场景主战场在桌面 Web，触屏适配做响应式降级即可。
6. **不在 v1 做主题可视化编辑器**：先保证 token 可代码级定制。

---

## 7. 成功指标

开源项目的存活取决于"被真实产品采用"，不是 star。

| 指标 | 6 个月 | 12 个月 |
|---|---|---|
| L1 组件数（含文档+demo+i18n） | 28 | 45 |
| 文档站可在线预览组件占比 | 100% | 100% |
| npm 周下载 | 2k | 15k |
| **可确认的真实生产采用**（含 JitWord/JitKnow 自身） | 3 | 15 |
| GitHub star | 800 | 4k |
| 外部贡献者（非核心团队） | 8 | 30 |
| 未关闭 P0 可访问性缺陷 | 0 | 0 |

**第一个采用者必须是 JitWord/JitKnow 自己。** 用自己的产品养组件库，是这类库唯一的冷启动路径；否则组件 API 会脱离真实办公场景，长成"又一个通用库"。

---

## 8. 主要风险与对冲

| 风险 | 判断 | 对冲 |
|---|---|---|
| **与 Univer 定位重叠，被其 UI 覆盖** | 中低。Univer 的 UI 服务于它自己的内核，且绑定其插件体系 | 官方提供 Univer adapter，把它当合作方而非对手；我们的差异化在"不绑内核" |
| **办公外壳需求量不足，社区觉得"就这几点东西"** | 中。这是最真实的死亡风险 | 用 `preset-*` 整页模板把可见价值放大——用户能一眼看到"一个合同审阅界面"，而非 28 个孤立组件 |
| **L2 内核坑过深，拖垮 L1 节奏** | 高 | L2 独立包、独立版本、允许长期 beta。L1 稳定发版永不等待 L2 |
| **Vue 3 生态在办公场景渗透率低于 React** | 中 | 需求 7 的 UMD/jQuery 路径同时是**给 React 用户的桥**：可在任意框架里以 DOM 方式挂载 L1 组件 |
| **图标工作量被严重低估** | 高。办公图标（对齐、缩进、边框、合并单元格、修订、批注、页眉页脚…）保守 300+ | 图标包独立发版、允许社区按批贡献；v1 只交付 Ribbon 必需的 120 个 |
| **中英日三语维护成本** | 中 | 语言包结构化 + 缺失 key 构建期报错，禁止运行时兜底英文静默上线 |
