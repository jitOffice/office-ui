# Design Token 体系

命名空间 `oj`（Office JIT）。所有公开变量以 `--oj-` 开头，所有 class 以 `oj-` 开头。

## 0. 实测基线

以下值从 `jitword.com` 与 `know.jitword.com` 的运行时 `getComputedStyle` 抓取，是"默认风格"的**唯一事实来源**。任何 token 若与这些值冲突，以本表为准并回查是否改错了。

| 用途 | 实测值 | 来源 |
|---|---|---|
| 品牌主色 | `rgb(22,93,255)` = `#165DFF` | 两站主按钮、链接、强调标题 |
| 主文本 | `rgb(21,21,21)` = `#151515` | body / heading |
| 次文本 | `rgb(108,111,125)` = `#6C6F7D` | 描述文案 |
| 品牌浅底 | `#F0F5FF` / `#EFF3FF` | 标签、选中项、hover 底 |
| 品牌描边 | `#E8ECFF` | 卡片 1px 边框 |
| 中性浅底 | `#F5F5F5` `#E5E5E5` | 占位、禁用 |
| 毛玻璃面板 | `rgba(255,255,255,.92)` + `blur(40px)` + `1px solid #E8ECFF` | 顶栏、悬浮卡 |
| 轻毛玻璃 | `rgba(255,255,255,.3)` + `blur(3px)` | 分段控件底 |
| 卡片圆角 | `20px`（外层）/ `12px`（内层）/ `10px` / `8px` / `6px`（按钮）/ `4px`（标签） | 全站 |
| 状态色 | `#10B981` success / `#F97316` warning / `#FF6B6B`·`#F87171` danger / `#FACC15` 图表黄 | 标签、指示点 |
| 字体 | `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` | 两站 root |

结论：JitWord/JitKnow 的视觉基线 = **Arco 蓝（#165DFF）+ Tailwind 状态色 + 大圆角 + 强毛玻璃 + 系统字体**。我们自研 token，但主色刻度与 Arco 的 1–10（6 为品牌）保持一致，便于用户从 Arco 迁移、也便于我们参照其成熟度模型。

---

## 1. 三层结构

```
Seed  种子     不可再拆的原始值，只允许被 alias 引用
  ↓
Alias 语义     按用途命名（text/bg/border/focus…），主题切换只改这一层
  ↓
Component 组件  组件私有钩子（--oj-button-bg），只从 alias 取默认值
```

规则，违反即视为 bug：

1. **组件 CSS 里禁止出现字面色值、px 魔法数**。只允许 `var(--oj-*)` 与 `calc()`。
2. **Component 层不得被另一个组件引用**。跨组件复用必须上升到 Alias。
3. **Seed 层不参与暗色重映射**。暗色只重写 Alias（+ 少量 Seed 中的色板）。
4. Alias 层禁止互相引用超过 2 级，避免循环与运行时解析成本。

### 目录与产物

M0 落地的真实结构（`packages/tokens/`）：

```
src/
  color.ts          # HSL↔hex、WCAG 相对亮度与对比度。自研，约 120 行
  seed.ts           # 唯一手写的原始值：品牌 HSL、ink、状态色、亮度档位、钉值表
  palette.ts        # 色板生成 + 索引镜像
  tokens.ts         # 单张扁平注册表，一条 = 一个变量 = 四个维度的取值
  resolve.ts        # 分层合并(pick) → var() 展开 → 注册表校验
scripts/
  generate.ts       # 发射器。buildArtifacts() 是纯函数，供契约检查复用
test/
  palette.test.ts   # 色板确定性与锚点档位
  parity.test.ts    # 双产物同源性：独立解析 dist/index.css 文本与 src 对账
  contrast.test.ts  # WCAG 门禁
dist/               # 全部生成，git 忽略
  index.css  index.js  index.cjs  index.d.ts
  themes/dark.css  themes/compact.css
```

`alias/light.ts`、`component/button.ts` 这类"一维度一文件"的拆分方案已作废：一个变量在
亮/暗/紧凑/语言四个维度下取什么值必须**在同一行看得见**，拆到四个文件里就会开始出现
"改了亮色忘改暗色"。注册表用一行一条目的对象数组，可读性足够，且能被测试整体校验。

`seed.ts` 改一个值 → 构建期产出 CSS 变量 + JS 对象 + 类型，三者同源。**这一步不能省**，理由见 §6。

---

## 2. Seed 层

```ts
export const seed = {
  // 品牌：#165DFF → hsl(222, 100%, 54%)
  brandHue: 222,
  brandSat: 100,
  brandLight: 54,

  // 中性：以 #151515 为最深处，纯灰（不加蓝调，蓝调交给 brand-tint）
  ink: '#151515',
  graySteps: 10,

  // 圆角：对齐实测 4/6/8/10/12/20
  radius: 4,          // 基数，其余为倍数
  radiusFull: 9999,

  // 间距：4px 栅格
  space: 4,

  // 字号：12 基准，1.25 模数
  fontSize: 12,
  fontScale: 1.25,

  // 动效
  duration: 100,      // ms，其余为其倍数
  easeOut: 'cubic-bezier(0.34, 0.69, 0.10, 1.00)',
  easeStd: 'cubic-bezier(0.40, 0.00, 0.20, 1.00)',
}
```

### 色板算法（确定性，可复算）

固定 `hue=222`，`sat=100%`，亮度按档位取值，`m = L − C/2`。下表由
`node packages/tokens/scripts/generate.ts` 实际产出，**不是手算值**——早期手算稿在 1/2/4/5/7/8/9
档都有 1–2 个通道的偏差，这类偏差靠肉眼发现不了，只能靠"文档数字必须来自产物"这条纪律消除。

| 档 | L | 产物 | 用途 |
|---|---|---|---|
| 1 | 95% | `#E5EDFF` → **钉为 `#F0F5FF`** | 极浅底（选中行） |
| 2 | 90% | `#CCDCFF` | 浅底 hover |
| 3 | 82% | `#A3BFFF` | disabled 主色 |
| 4 | 72% | `#709CFF` | 次级强调 |
| 5 | 63% | `#427CFF` | active 前 |
| **6** | **54%** | **`#145BFF` → 钉为 `#165DFF`** | **品牌** |
| 7 | 45% | `#0046E6` | hover |
| 8 | 37% | `#003ABD` | active |
| 9 | 30% | `#002F99` | 深色文字用 |
| 10 | 22% | `#002270` | 暗色模式浅底 |

第 6 档算出 `#145BFF` 与实测 `#165DFF` 差 2/0/0，**肉眼不可辨**，但为了像素级对齐 JitWord，
`--oj-brand-6` 在构建后**硬钉为 `#165DFF`**。同理 `--oj-brand-1` 钉为实测 `#F0F5FF`、
`--oj-border-1` 钉为 `#E8ECFF`。

> 设计决策：**算法负责生成 1–10 的完整梯度，实测值负责钉住少数被真实 UI 使用的档**。两者冲突时实测值赢。
> 这样既能在改主色时一键重算全站，又保证默认主题与 JitWord 现状零差异。

**档位是绝对亮度，不是"相对品牌的偏移"。** 因此每个色族的实测主题色落在哪一档，取决于它自身的明度：

| 色族 | 实测色 | HSL | 锚点档 |
|---|---|---|---|
| brand | `#165DFF` | 222, 100%, 54% | **6** |
| warning | `#F97316` | 25, 95%, 53% | **6** |
| danger | `#FF6B6B` | 0, 100%, 71% | **4** |
| success | `#10B981` | 160, 84%, 39% | **8** |

`palette.test.ts` 把这四个锚点档位钉成断言——它们是公开契约，改动要走 ADR。
**消费方不要猜档位，一律引用别名**：`--oj-color-success` / `--oj-color-warning` / `--oj-color-danger` /
`--oj-color-info` / `--oj-color-brand`。`info` 与 `link` 复用品牌色，与两站实测一致。

灰色另用一套亮度档 `[96,90,85,78,68,55,42,30,19,8.24]`，第 10 档钉死实测 `ink = #151515`；
不共用色板档位是因为品牌档梯度的深端（L=22%）比界面所需的"最深中性色"浅得多。
图表 8 色（`#165DFF #10B981 #F97316 #7C3AED #0891B2 #DB2777 #FACC15 #4F46E5`）作为 seed 直接进表，不生成梯度。

**变量值一律用完整色值，不用 RGB 三元组。** Arco 把色板存成 `--red-1: 77,0,10` 再以 `rgb(var(--red-1))`
消费（其 `dist/arco.css` 里这种写法出现 505 次）。这个形式有两个硬伤：`border: 1px solid var(--x)`
直接失效（必须记得包 `rgb()`），以及**阻断了 `color-mix()`** 这类需要完整色值的现代用法。
我们的做法：主变量存 hex，需要透明度的地方（`--oj-bg-glass`、`--oj-bg-mask`、阴影、玻璃高光）
**直接写 `rgba()` 字面值**，不派生 `--oj-*-rgb` 伴生变量。伴生变量会让每个半透明 token 在
暗色覆写与双产物对账里都多出一条，收益却只是"少写一个 rgba()"。

**品牌锚定在第 6 档。** 五家对此不一致：Arco 的默认主色是 `-6`，TDesign 是
`--td-brand-color: var(--td-brand-color-7)`。我们锚 6，因为实测的 `#165DFF` 按本算法就落在
6 档（L≈54%），且与 Arco 用户的心智模型一致。锚点是公开契约，定了不再改。

---

## 3. Alias 层

命名 `--oj-{类别}-{语义}-{状态}`。

### 文本

```
变量               亮色值                   vs bg-container   暗色值                   vs bg-container
--oj-text-1        #151515   标题/正文       18.26:1          #F2F3F5                  15.98:1
--oj-text-2        #3D3D45   次要正文        10.76:1          #D4D6DE                  12.23:1
--oj-text-3        #6C6F7D   辅助/说明        4.99:1          #A0A3B0                   7.06:1
--oj-text-4        #8A8C96   占位符          3.35:1          #7A7D8B                   4.34:1
--oj-text-5        #C9CAD1   禁用            1.63:1          #55585F                   2.49:1
--oj-text-inverse  #FFFFFF   品牌底上的反色   （对容器底无意义，配 bg-brand 用 5.19:1 反向）
--oj-text-brand    var(--oj-brand-6) → #165DFF 5.19:1        → #4080FF                 4.86:1
--oj-text-link     var(--oj-brand-6) → #165DFF 5.19:1        → #4080FF                 4.86:1
--oj-text-success  var(--oj-success-10) → #096748 6.90:1     → #E8FDF6                16.74:1
--oj-text-warning  var(--oj-warning-8) → #B84E05  5.08:1     → #FDC9A6                11.89:1
--oj-text-danger   #D93A3A                  4.55:1          #EA9090                   7.51:1
```

`contrast.test.ts` 是本表的守门人，策略分三层，**不是一句"全部 AA"**：

1. **text.1 / text.2 / text.3 与所有语义文字色：AA 4.5:1**，在 `bg-container`、`bg-page`、`bg-hover`
   三种底上都必须过。它们是承载信息的正文。
2. **text.4 占位符：3.0:1**。这是一个显式的、写进文档的取舍：白底上要做出一套
   四级可辨识的灰阶文本且每级都 ≥4.5:1 **做不到**——实测 `#6C6F7D` 已经 4.99:1，
   再浅一档还要守住 4.5:1，亮度区间只剩 0.160 → 0.183，肉眼分不出两级。
   占位符不承载独有信息（label 与已填值都在）、输入即消失，故取其 3:1。
   **需要严格 AA 的表单，文档明确要求把 placeholder 指到 `--oj-text-3`**，这是使用方的一个动作，不是我们的默认。
3. **text.5 禁用态：不设数值门槛**。WCAG 1.4.3 明确豁免 inactive controls；
   但对它有一条**结构不变量**——灰阶梯度上每一级的对比度必须严格低于上一级，
   防止有人把 disabled 调得比 placeholder 还醒目。

三处偏离实测基线，都是被门禁逼出来的，保留在原值旁边以防被"改回去"：

- `--oj-text-4`：实测 `#9A9CA6` 对白底 **2.73:1**，连占位符的 3:1 底线都不过 → 加深为 `#8A8C96`（3.35:1）。
- `--oj-text-success`：`success-9` `#0C8D62` 只有 4.20:1，正文级必须用 `success-10` `#096748`（6.90:1）。
- `--oj-text-danger`：实测 `#FF6B6B` 对白底仅 **2.78:1**，不能作正文色，另取 `#D93A3A`（4.55:1）；
  `#FF6B6B` 仍然是 `--oj-color-danger`（边框、指示点、填充底）。

### 镜像能自动带过什么，不能带过什么

写成 `var(--oj-*-N)` 的引用**不需要**给 `dark`：档位镜像（§2）会让同一个变量名在暗色主题下
落到相反的一端，`--oj-text-brand` 因此自动从 `#165DFF` 变成 `#4080FF`，`--oj-text-success`
自动从 `#096748` 变成 `#E8FDF6`。`parity.test.ts` 专门有一条断言盯住这个反转换。

写成 `#RRGGBB` 的字面色**必须**给 `dark`，否则暗色主题原样沿用亮色值。`--oj-text-danger`
就栽在这里：它为了过亮色 AA 被写成字面色，暗色下漏给 `dark`，`#D93A3A` 对 `#17181C` 只有
**3.90:1**，静默地掉到 AA 以下、不报错。修法是补一个 `dark: '#EA9090'`（7.51:1），
并把这条升成结构门禁：**注册表里任何 `light` 为六位十六进制的条目都必须有 `dark`**
（`contrast.test.ts` 的「写字面色就必须同时写暗色」），这样下一处同类错误在提交时就爆，
而不是等视觉回归截图对比去发现。

字面色本身不是偷懒。danger 族的种子 `#FF6B6B` 是 100% 饱和，算法推到高档位只会得到
`#E60000` 这类刺眼的纯红，作正文色不可用；Element Plus、Arco 同样为语义文字单列手调档位。
`#D93A3A` / `#EA9090` 是同一对取舍的亮暗两半，成对出现才成立。

### 背景
```
--oj-bg-page    #F7F8FC   应用底（毛玻璃需要底下有内容可透）
--oj-bg-container #FFFFFF  卡片/面板
--oj-bg-elevated  #FFFFFF  弹层/下拉
--oj-bg-glass     rgba(255,255,255,.92)   实测顶栏
--oj-bg-glass-soft rgba(255,255,255,.72)  次级玻璃
--oj-bg-mask      rgba(21,21,21,.45)      遮罩（实测 0.5，取 .45 以保留玻璃感）
--oj-bg-hover     #F2F3F7
--oj-bg-active    #E8ECFF                 实测 border 色复用为选中底
--oj-bg-brand     var(--oj-brand-6)
--oj-bg-brand-subtle #F0F5FF              实测品牌浅底
--oj-bg-success-subtle / --oj-bg-warning-subtle / --oj-bg-danger-subtle
```

### 边框 / 焦点 / 阴影 / 玻璃
```
--oj-border-1  #E8ECFF   主边框（实测，带蓝调）
--oj-border-2  #E5E6EB   中性边框
--oj-border-3  #D0D2DB   强边框/输入框
--oj-border-grid #EDEEF2  canvas 网格线，刻意比 border-2 更浅：网格是背景纹理不是控件边界
--oj-border-brand var(--oj-brand-6)
--oj-focus-ring  0 0 0 2px var(--oj-brand-3)   焦点环，勿用 outline:none 裸删
--oj-shadow-1  0 1px 2px rgba(21,21,21,.04), 0 2px 8px rgba(22,93,255,.06)
--oj-shadow-2  0 4px 16px rgba(21,21,21,.08), 0 1px 3px rgba(22,93,255,.08)
--oj-shadow-3  0 12px 40px rgba(21,21,21,.14)
--oj-glass-blur      40px
--oj-glass-blur-soft  8px
--oj-glass-highlight inset 0 1px 2px rgba(255,255,255,.9)   实测内白高光
```

`shadow` 一律带一点蓝调（`rgba(22,93,255,.06)`），这是 JitWord 界面"不发灰"的关键，别退回纯黑阴影。

### CSS 变量名与 JS 路径不能互相反推

注册表里的点分路径（`bg.glassSoft`）决定 JS 树的形状，kebab 化后决定 CSS 变量名
（`--oj-bg-glass-soft`）。**但反过来不成立**：`--oj-bg-glass-soft` 既可能是 `bg.glass.soft`
也可能是 `bg.glassSoft`，而前者在 JS 树里是非法的——`bg.glass` 已经是叶子，同一个键不能
既是值又是对象，后写入的一方会被静默覆盖。

规则：**任一路径不得是另一路径的严格前缀**，`validateRegistry()` 会检查（parity 测试第一条断言）。
因此凡"某级的叶子 + 该级的派生变体"都要改成 camelCase 后缀：
`bg.glassSoft`、`bg.brandSubtle`、`glass.blurSoft`、`font.monoCjk`、`grid.picker.cellActiveBg`。
发射器通过注册表反查路径建树，绝不按 `-` 拆变量名。

### 圆角 / 间距 / 字号 / 行高 / 动效
```
--oj-radius-xs 4   --oj-radius-sm 6   --oj-radius-md 8
--oj-radius-lg 12  --oj-radius-xl 20  --oj-radius-full 9999
--oj-space-1 4  --oj-space-2 8  --oj-space-3 12  --oj-space-4 16
--oj-space-5 20 --oj-space-6 24 --oj-space-8 32 --oj-space-10 40

--oj-font-sans   "Inter Variable", ui-sans-serif, system-ui, "PingFang SC",
                 "Microsoft YaHei", "Hiragino Kaku Gothic ProN", "Yu Gothic UI",
                 "Noto Sans JP", "Noto Sans SC", sans-serif,
                 "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"
--oj-font-mono   "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace
--oj-font-doc    "Source Han Serif SC", "Noto Serif SC", "Songti SC", SimSun, serif
                 ↑ 文档正文排版用，Office 场景必须有衬线选项

--oj-fs-12 12  --oj-fs-13 13  --oj-fs-14 14  --oj-fs-16 16
--oj-fs-18 18  --oj-fs-20 20  --oj-fs-24 24  --oj-fs-32 32
--oj-lh-tight 1.25  --oj-lh-normal 1.5  --oj-lh-loose 1.75
```

`--oj-fs-13` 必须存在：Office 工具栏密度下 12 太小、14 太大，13px 是 Ribbon 的实际工作字号（Word/WPS 均如此）。

### z-index 层阶（Office 场景刚需）
```
--oj-z-canvas    0     文档/网格画布
--oj-z-sticky    10    表格冻结行列、行号列
--oj-z-ribbon    100   顶部工具栏（常驻）
--oj-z-drawer    500   侧栏：批注、大纲、模板
--oj-z-dropdown  1000  下拉、颜色/表格选择器浮层
--oj-z-modal     2000
--oj-z-popover   3000  气泡卡片、tooltip
--oj-z-toast     4000
--oj-z-max       9000  全屏演示/放映模式
```
必须显式分层。Office 应用里"网格冻结行 + 下拉浮层 + 批注抽屉"叠在一起是常态，靠组件各自 `z-index: 9999` 必然打架。

---

## 4. 主题维度（正交，可组合）

四个独立开关，不要做成四套互斥主题：

| 维度 | 取值 | 挂载方式 |
|---|---|---|
| 明暗 | `light` \| `dark` | `html[data-oj-theme="dark"]` |
| 密度 | `comfortable` \| `compact` | `html[data-oj-density="compact"]` |
| 玻璃 | `on` \| `off` | `html[data-oj-glass="off"]` |
| 主色 | 任意 hex | `:root` 上覆写 `--oj-brand-*` |

```html
<!-- 办公编辑器典型组合：紧凑 + 暗色 + 关玻璃（canvas 上模糊会掉帧） -->
<html data-oj-theme="dark" data-oj-density="compact" data-oj-glass="off">
```

- **暗色靠"色板索引镜像"，不靠给组件加暗色分支**。`data-oj-theme="dark"` 下重新声明色板：亮色的 `n` 档对应暗色的 `11−n` 档（`--oj-brand-6` 在暗底上取亮色 `--oj-brand-5` 的亮度，实际值提亮为 `#4080FF`）。Alias 层的**结构**保持不变，组件 CSS 一行都不用改。这是 Arco 的做法，也是五家主流库里最干净的暗色方案。
- **明暗选择器双写**，兼容生态习惯：`html[data-oj-theme="dark"], html.dark { … }`。同时设 `color-scheme: dark`，让原生滚动条/表单控件跟随。
- **前缀只能在构建期改，不支持运行时改**。Element Plus 的 `useNamespace` 能在运行时换 **class** 前缀，但编译出的 CSS 里 `--el-*` 是字面量、换不掉——五家没有一家解决了"运行时可换的变量命名空间"。我们不提供这个能力，也不要在文档里暗示支持。
- **`data-oj-glass="off"` 是性能开关，不是审美开关**。`backdrop-filter` 在大面积滚动容器上会强制合成层，
  文档画布/虚拟表格场景必须能一键关掉。**它落在组件 CSS 层，不落在 token 层**：注册表里没有第四个
  覆写字段，因为"要不要用那个半透明底"是渲染策略决定，不是取值决定——
  `html[data-oj-glass="off"] .oj-panel { backdrop-filter: none; background: var(--oj-bg-container); }`。
  把 `--oj-bg-glass` 改成不透明反而会让高光、圆角、阴影三处继续按"下面是透的"来画。
- **密度只改 Alias 中的 space/radius/font-size/height**，不改组件 CSS。`compact` 下 `--oj-control-height` 从 32 → 28，Ribbon 从 96 → 76。

### 控件高度
```
--oj-control-height-xs  24
--oj-control-height-sm  28
--oj-control-height-md  32   ← 默认
--oj-control-height-lg  40
--oj-ribbon-height      96
```

不设 `--oj-ribbon-height-compact`。它和密度维度覆写是同一件事的两种写法，
留两条就会有"画布代码读了变量、CSS 读了另一条"的分叉风险；紧凑下的 76px
由 `--oj-ribbon-height` 的 compact 覆写给出，JS 侧 `createTokens({ density: 'compact' })` 取到同一个值。

---

## 5. Component 层

每组件暴露可覆写钩子，默认值全部来自 Alias：

```css
.oj-button {
  --oj-button-height: var(--oj-control-height-md);
  --oj-button-padding-x: var(--oj-space-4);
  --oj-button-radius: var(--oj-radius-sm);
  --oj-button-bg: transparent;
  --oj-button-color: var(--oj-text-1);
  --oj-button-border: var(--oj-border-3);

  height: var(--oj-button-height);
  border-radius: var(--oj-button-radius);
  /* … */
}
.oj-button--primary {
  --oj-button-bg: var(--oj-bg-brand);
  --oj-button-color: var(--oj-text-inverse);
  --oj-button-border: transparent;
}
```

用户只需 `.oj-button--primary { --oj-button-bg: #0A84FF }` 即可局部改色，无需覆盖整条 `background` 声明、无需 `!important`。这是"企业级可定制"的实际含义。

---

## 6. 为什么必须双产物（CSS + JS）

**这是 Office 组件库与普通 Web 组件库最大的架构分歧点，务必在第一天做对。**

表格网格、文档画布、标尺、选区高亮、放映模式都要在 `<canvas>` 上绘制。Canvas 拿不到 CSS 变量——只能 `getComputedStyle()` 逐个读，在 60fps 的网格渲染循环里这是灾难性开销，且 SSR/Worker 下不可用。

因此 `@jitoffice/tokens` 必须同时导出：

```ts
import { tokens, createTokens, tokenNames } from '@jitoffice/tokens'

ctx.fillStyle = tokens.bg.container        // '#FFFFFF'
ctx.strokeStyle = tokens.border.grid       // 网格线
ctx.fillText(text, x, y)                   // tokens.font.sans

// 主题/密度/语言切换后重新取，不要长期缓存
const dark = createTokens({ theme: 'dark', density: 'compact', lang: 'ja' })
```

- `index.css` 与 `index.js`/`index.cjs` 由同一份注册表构建产出，**禁止手写其中任何一份**。
- JS 侧 token 必须是**已解析的字面值**（不含 `var()`），构建期完成 alias 展开。
- 展开必须在**合并后的主题表**上做。`--oj-text-brand: var(--oj-brand-6)` 在暗色下要拿到暗色品牌色；
  先在亮色 seed 表上解析、再套暗色覆写，会得到一个"暗色界面里的亮色文字"，
  而且只在引用型 token 上出错——这类 bug 靠肉眼极难发现，所以 `parity.test.ts` 有专门一条断言。
- 产物体积的做法：`BASE` 全量表（亮/舒适/zh）+ 其余 11 个组合的**解析后字面值差异表**，
  运行时只做一次深合并并缓存。既不把 12 个组合全量内联（约 4 倍体积），
  也不把 `var()` 解析器带进运行时。差异按"解析后"而非"原始值"计算，
  这是深合并结果与 `resolveMap` 完全一致的前提。
- `lang` 只有 `zh`（基底）/ `zh-TW` / `ja` 三个取值，`en` 与基底同值，因此不作为参数暴露。
- 主题切换时向 canvas 层广播 `oj:theme-change`，触发重绘。canvas 组件不得缓存 token 值。

---

## 7. 中英日本地化对 token 的影响

语言不只是文案，会真实改变视觉参数。通过 `html[lang|="ja"]` 挂规则：

| 维度 | zh-CN | zh-TW | ja | en |
|---|---|---|---|---|
| 首选字体 | PingFang SC / Microsoft YaHei | PingFang TC / Microsoft JhengHei | Hiragino Kaku Gothic ProN / Yu Gothic UI | Inter / system-ui |
| 基准字号 | 14 | 14 | **13**（假名笔画密，同字号显小） | 14 |
| 正文行高 | 1.5 | 1.5 | **1.5715**（JIS 惯例） | 1.5 |
| 字距 | 0 | 0 | **0.02em** | 0 |
| 日期格式 | 2026-10-09 | 2026年10月9日 | 2026年10月9日 | Oct 9, 2026 |
| 和字/全角标点 | `，。、` | `，。、` | `、。` + 长音符 `ー`（`strict` 会禁止它落行末，代价见 §7） | `. ,` |
| 换行 | `word-break: normal` | 同 | **`line-break: strict`**（禁止行首出现 `。、』`） | 同 en |

**`en` 不是 token 维度，`zh-TW` 是。** 英文界面的差异全部落在文案与日期格式上，没有任何
视觉参数需要用 `lang="en"` 覆写——它的字号、行高、字距与 `zh` 基底完全一致，所以注册表里
不给 `en` 开槽位。`createTokens()` 的类型也只接受 `'zh' | 'zh-TW' | 'ja'`；传别的值不会抛错，
而是安静地落回基底表（组合键查不到 diff 表），这对一个零依赖运行时是正确的取舍：
拼错的 locale 不应该让宿主应用崩掉，它只是拿不到覆写而已。
`zh-TW` 相反：繁体的差异只有一项，但那一项是**必须**覆写的——繁体 Windows / macOS 上
常常同时装着 `PingFang SC` 与 `Microsoft YaHei`，不覆写字体栈就会命中简体字形，
「裏、关、直、骨」这类差异字在界面上大量出现，是繁体用户一眼就能看出的错误。

**语言覆写层一律用 `|=`（子标签/前缀匹配，CSS 2.1 §6.3.1），不用 `=`。** 这条不是风格偏好：
i18n 语言包的 `name` 是完整 BCP-47 标签（`ja-JP`、`zh-TW`），`LocaleProvider` 把它逐字写进
`document.documentElement.lang`。写成 `html[lang="ja"]` 就永远匹配不到 `lang="ja-JP"`，于是
字体栈、基准字号、行高、字距**整层**对日文界面静默失效——而 tokens 的产物一致测试和 i18n 的
语言包测试各自都仍然全绿，两边都不知道自己漏了对方。这个缺陷在本仓库真实发生过一次。
`|="ja"` 同时命中 `ja` 与 `ja-*`，正是 CSS 为语言子标签设计的写法，无需 `@supports`，
浏览器基线（含信创环境的旧内核）全部支持。
现在由 `internal/scripts/check-contracts.ts` 的门禁守住三个方向：某个语言的 `name` 命不中任何
覆写层、某个覆写层匹配不到任何内置语言（死层）、以及基底档（`tokenLang: 'zh'`，含 `en-US`）
的语言被覆写层误捞走。断的是产物 `dist/index.css` 里真实发射的选择器，不是生成器的源码常量。

### 繁体专项

```css
/* 产物里发射两个选择器：只写语系不带地区的宿主（`lang="zh-Hant"`）也要能命中。 */
html[lang|="zh-TW"],
html[lang|="zh-Hant"] {
  --oj-font-sans: "Inter Variable", ui-sans-serif, system-ui, "PingFang TC",
                  "Microsoft JhengHei", "Noto Sans TC", sans-serif, ...;
}
```
只有 `font.sans` 一条覆写。字号、行高、字距一律沿用基底——繁体没有「字小一号」的排版惯例，
硬套日文的 13px 反而是错的。

### 日文专项（本库的真实差异化点）

调研结论值得警惕：**五家主流 Vue 库的字体 token 里根本没有日文字体。** Element Plus 是 `"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif`，TDesign 是 `PingFang SC, Microsoft YaHei, Arial Regular`（`Arial Regular` 甚至不是合法字族名），Arco 的 CJK 命中也只有 `PingFang SC`/`Hiragino Sans GB`/`Microsoft YaHei`。也就是说日文用户用任何一家主流库都要自己补字体栈——我们把这件事做对，是低成本低门槛的差异化。

```css
/* 以下即 dist/index.css 中真实发射的那一段。
   注册表里 `font.sans` / `fs.14` / `fs.16` / `lh.normal` / `letter.spacing`
   各自带一个 `ja` 字段，发射器直接内联展开，不引入 `--oj-*-ja` 中间变量——
   中间变量只在「运行时可切换」时才有价值，而这里的覆写在构建期就已确定。 */
html[lang|="ja"] {
  /* Windows 上必须用 "Yu Gothic UI" 而非 "Yu Gothic"：
     后者在 font-weight < 900 时会被合成加粗，且字号 ≥ 96px 时字重突变 */
  --oj-font-sans: "Yu Gothic UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans",
                  "Noto Sans JP", Meiryo, sans-serif;
  --oj-fs-14: 13px;          /* 语义档不变，实际值降一档 */
  --oj-fs-16: 15px;
  --oj-lh-normal: 1.5715;    /* JIS 惯例值，比 1.5 稳 */
  --oj-letter-spacing: 0.02em;
}
```

`line-break`、`text-autospace` 这类是**元素级排版规则**而非可取值的 token，不进注册表，
由 `packages/tokens/scripts/generate.ts` 的 `resetSection()` 发进 `dist/index.css` ——
这是 tokens 产物里唯一碰元素的选择器，其余全是变量表：

```css
/* 以下即 dist/index.css 中真实发射的那一段 */
html[lang|="ja"] body {
  line-break: strict;
  word-break: normal;
  text-underline-position: from-font;
  text-autospace: normal;
}

html:not([lang|="ja"]) body {
  -webkit-font-smoothing: antialiased;
}
```

**这里刻意不加 `@supports`。** ADR-0002 要求老内核目标用 `@supports` 包裹并"给出降级值"，
而排版层里没有一条有可降级的替代值：`text-autospace` 被老内核丢弃的后果只是少插 0.25em 间隙，
不会排错版；`from-font` 不支持时退回 `auto`，也就是本来就要避免的默认行为，包一层 `@supports`
改变不了结果。B2 已拍板取 Chromium 86，所以这条在信创内核上**必然被丢弃**，接受的就是上面那句后果；
若要进一步改写成别的写法，放在 ui 包的样式构建里做（见 05 偏差 10），不动 tokens 产物。

### 实测记录 · 2026-10-09（Chromium 150.0.7871.114 / Electron 43.1.1，`file://` 直接加载 `dist/index.css`；同批断言随后由 Playwright 在 Chrome 151.0.7922.175 与 Edge 154.0.4258.62 各复跑一遍，结论不变）

作用域全部按预期命中——`lang="ja"`、`ja-JP`、`ja-JP-x-kansai` 三种写法都拿到
`line-break: strict`、`text-underline-position: from-font`、`text-autospace: normal` 与
`--oj-fs-14: 13px`；`zh-CN`、`zh-TW`、`zh-Hant`、`en-US` 拿到 `-webkit-font-smoothing: antialiased`，
而日文界面拿不到（`auto`）。

**排版层的两条规则都实测生效。而本节先后出现过两次"量不出效果"的结论，两次都是量法错误**，
记下来是因为这类缺陷不会自己冒出来，仪器错了比规则错了更危险：

| 想验的东西 | 用过的错误量法 | 为什么给出假阴性 | 正确量法 |
|---|---|---|---|
| `line-break` 禁则 | 比较逐行盒宽度 | 禁则移动的是**断点位置**，不是行宽 | 逐字符取 `getBoundingClientRect().top` 归行，读每行行末字符 |
| `text-autospace` 间距 | `none` 对 `normal` | `none` 不是合法关键字，整条声明被丢弃，等于拿 `normal` 比 `normal` | `no-autospace` 对 `normal`，量 nowrap 容器宽度 |

第三次坏的不是量法而是**接线**，症状也相反——它给的是假阳性：
Playwright 用例第一次真跑全绿，把产物 `line-break: strict` 改成 `auto` 却只让断计算值的那条变红，
另外两条纹丝不动。原因是它们在测试自建的盒子上**内联**写了被测属性，
内联样式压过 `body` 的继承值，于是量的是 UA 行为，`dist/index.css` 写什么都看不见。

| 想验的东西 | 用过的错误量法 | 为什么给出假阳性 | 正确量法 |
|---|---|---|---|
| 产物里那条声明是否真的作用到内容上 | 在盒子上 `setProperty` 被测属性再量 | 内联 > 继承，测试值覆盖了产物值 | 那条声明**不写**，让它从 `body` 继承下来；显式设值只当对照组 |

`line-break: strict` —— 可复现设置（180px 内容宽、16px Yu Gothic UI、`word-break: normal`、
无内边距与边框，样本 `カタカナ語の長音符ァィゥェォーッーを行末に置く禁止規則の確認用テキストテキストテキスト`），
四行的行末字符依次排成一行：

| `line-break` | 各行行末字符 |
|---|---|
| `auto` | `ゥ止スト` |
| `loose` | `ゥ止スト` |
| `normal`（CSS 初始值） | `ゥ止スト` |
| `strict` | `の末テト` |

半宽小假名 `ゥ` 落在行末是 `strict` 禁止、其余三种都允许的行为。第三行才是关键：
**CSS 初始值 `normal` 与 `auto`/`loose` 一样放任违禁字符落行末**，所以产物必须显式写 `strict`，
"内核会按文档语言自己判断"不成立——旧记录里那句"日文文档下 `normal` 已经接近 `strict`"是错的。
这组数字已由 `packages/tokens/test/visual/typography.spec.ts` 锁住并**实跑通过**。
用例断的是"违禁字符集合是否为空"，不是上表那四个字符本身，所以换内核换字体时它仍然有意义：
本机 Chrome 151、Edge 154 上"显式 `auto` 有违禁、产物继承值无违禁"同样成立。

`text-autospace: normal` —— nowrap 样本 `テキストABCテキスト123テキスト。`（16px Yu Gothic UI，
无样式表的空白文档，用来隔离 UA 默认值）：

| 情况 | 宽度 |
|---|---|
| 不设置 | `207.484px` |
| `text-autospace: no-autospace` | `207.484px` |
| `text-autospace: normal` | `215.484px` |

差值 `8.000px` = 两处 CJK↔拉丁边界 × 每处 `4px`（0.25em，即字身两侧各 1/8 em）。
**该内核里 `text-autospace` 的计算值默认就是 `no-autospace`**，所以产物里那条 `normal`
是载荷性声明——删掉它日文混排就会少掉 8px 间距，它不是"以防万一"的保险。
同一组数字由 `test/visual/typography.spec.ts` 锁住并已实跑通过，用例断言的是**差值**而不是绝对宽度：
间距按 em 计算与字体无关，绝对宽度取决于那台机器装了哪套字体。
把产物里那条 `normal` 整条删掉再做一次验证，Chrome 151 与 Edge 154 的计算值都退回 `no-autospace`，
所以"UA 默认就是无间距"不只成立于我那台 Electron。

**值域陷阱：`CSS.supports('text-autospace', v)` 在这个构建里只对 `normal` 与 `no-autospace` 为 true，
`ideograph-alpha`、`ideograph-numeric`、`punctuation`、`auto` 全为 false。**
把声明"写全一点"成 `text-autospace: ideograph-alpha ideograph-numeric`（按规范语义等同 `normal`）
会被整条丢弃，界面静默退回无间距，且没有任何报错。`typography.test.ts` 对这四个声明值用
`deepEqual` 钉死，就是为了拦住这类改写。

**`text-spacing-trim` 记"未验证"，先前那句"量不出效果"作废。** 产物不发它，但 B5 会碰到它。
旧记录用 40px 窄盒量到行首 `「` 始终落在 `x0`、四种取值无差——那同样是假阴性：标点压缩移动的是
**字形在字身盒内的位置**，字身盒本身不动，盒子坐标看不见它。要验它只能做像素级快照比对，归 B5。
（另外我先试的 `normalize-start` 不是合法关键字，`CSS.supports` 返回 false 不构成关于这条属性的证据。）

**`-webkit-font-smoothing: antialiased` 不得全局应用。** Element Plus 与 Arco 都在 `html` 上加了它，但会把 Yu Gothic 的笔画削细，日文界面明显发虚。所以它只发在 `html:not([lang|="ja"]) body` 里（上面那段产物已有），实测确认日文作用域拿到的是 `auto`。

`not()` 里同样必须是 `|=`：写成 `not([lang="ja"])` 时 `lang="ja-JP"` 会被判定为"非日文"而落进
antialiased 作用域，发虚问题原样回来——而且这次是**反向**失效，比缺覆写更难察觉。
门禁 8 因此禁止产物里出现 `[lang=` 这种精确匹配写法，测试 `typography.test.ts` 另断言
`-webkit-font-smoothing` 在全产物里只出现一次。

### 等宽档位（表格场景刚需）

普通等宽字体里中文占两个格子宽是"近似"而非精确，列对齐会逐格累积偏差。必须单列一个等宽档：

```css
--oj-font-mono:     "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
--oj-font-mono-cjk: "Sarasa Mono SC", "Source Han Mono SC", var(--oj-font-mono);
                    /* Sarasa / Source Han Mono 的 CJK 字宽严格等于 2 个拉丁字宽 */
```
单元格编辑态、公式栏、列宽数值一律用 `--oj-font-mono-cjk`。Sarasa Gothic 为 OFL-1.1，可捆绑，但**每次发版需复核其许可**。

字体授权红线：只允许捆绑 SIL OFL / Apache-2.0 字体（Inter、Noto Sans SC/JP、Source Han Sans/Serif、JetBrains Mono）。**不得**捆绑 PingFang（Apple 专有）、Microsoft YaHei（微软专有）、微软雅黑子集。它们只能作为**系统回退**出现在 font-family 字符串里——引用不产生分发，打包子集即构成再分发侵权。默认 `--oj-font-sans` 因此以系统栈为主，Webfont 作为可选 `@jitoffice/tokens/fonts` 单独包，用户自行决定是否加载。

---

## 8. 落地校验

token 体系会在三个月内退化成魔法数，除非 CI 卡住它。M0 已实现五条 tokens 侧校验（全仓十二条契约门禁见
02 §7 与 `internal/scripts/check-contracts.ts`），入口 `pnpm verify`
（= `tokens:gen` → `i18n:gen` → `test:node` → `lint`），**除 ESLint/Stylelint/tsc 外全部零依赖**，
`node` 直接跑，装不上依赖也能验证：

1. **注册表校验** `validateRegistry()`：重复路径、悬空 `var(--oj-*)` 引用、自引用，
   以及 §3 说的**树前缀冲突**。任何一条不过，生成器直接退出而不是写出半个产物。
2. **双产物同源对账** `parity.test.ts`：不用生成器的内部状态，而是**独立解析 `dist/index.css` 的文本**，
   按 CSS 级联顺序（`:root` → dark → compact → lang）重建 12 个组合的变量表，再与 `src` 的解析结果逐项相等。
   这条同时守住三件事：级联顺序写反、漏发覆写、变量名推导错。
   另有断言要求 JS 产物**不含任何 `var()`**（canvas 拿不到 var），以及
   `--oj-text-brand` 在暗色解析为 `#4080FF` 而非亮色 `#165DFF`。
   **第三张脸是类型**：`dist/index.d.ts` 的 `OjTokens` 同样由注册表推导，并有一条用例独立解析产物文本，
   把叶子路径集合与 `entries` 的 `path` 集合对账。原先它手写成 `[group: string]: Record<string, unknown>`，
   值与 CSS 全对得上，用户侧 `tokens.bg.contaier` 却照样编译通过并拿到 `unknown`——
   这条缺陷只有装上依赖跑 `tsc` 才暴露，光看运行时测不出来。
3. **WCAG 分层门禁** `contrast.test.ts`：见 §3 文本小节。附带三条结构不变量——
   灰阶梯度对比度必须严格递减；密度与语言维度**不得改变任何颜色 token**；
   `light` 写成六位十六进制的条目**必须同时给 `dark`**（镜像只救 `var()` 引用，见上）。
4. **语言排版层** `typography.test.ts`：§7 那两条元素级规则不在注册表里，parity 抓不到它们漏发，
   所以单独断言 CSS 文本——四条日文排版声明、`antialiased` 只出现在 `not([lang|="ja"])` 里且全产物仅一次、
   繁体没有排版层（设计决定）、`--oj-font-mono-cjk` 在 JS 侧已展开。
   配套的跨包检查是门禁 8：变量覆写层与排版层都要命中内置语言，产物里禁止 `[lang=` 精确匹配。
5. **产物新鲜度** `internal/scripts/check-contracts.ts`：`generate.ts` 的 `buildArtifacts()` 是纯函数，
   契约检查把它的输出与磁盘上的 `dist/*` 逐字节比较。改了 `seed.ts` 忘记重跑，CI 会指出
   `dist/index.css 已过期：src 与 dist 不同源`。同一脚本还检查发布包 `dependencies` 必须为空、
   `sideEffects` 不得为 `false`、`exports` 指向的文件真实存在且**不许指回 `./src/*.ts`**、
   入库 `dist` 里每份 `.d.ts` 的相对说明符都能在产物树里解析到、`catalog:` 键真实存在、
   `main`/`module`/`types` 逐字等于 `exports["."]` 的对应条件（缺字段也算违反）、有 `dist/umd` 产物就必须挂
   `unpkg`/`jsdelivr`。

   以上全部 **零依赖**：全仓 81 个用例由 `node --test` 直接跑，十二条契约检查同一条命令，不装包也不联网。

   另有一条**不属于上面这个集合**的用例链：`packages/tokens/test/visual/typography.spec.ts`（3 条，
   `*.spec.ts` 归 Playwright）验证的是"排版引擎真的照做"，需要浏览器，因此既不在 81 里也不在
   `pnpm verify` 里。三条已在 2026-10-09 真跑通过两套内核（本机 Chrome 151、Edge 154，
   走 `OJ_BROWSER_CHANNEL`；Playwright 自带的下载在本机没成功）。**首跑全绿不等于锁住了产物**：
   两条行为用例原先在盒子上内联设值，破坏产物后仍绿，现在改成从 body 继承——
   过程与规矩见 05 偏差 13。

待实现（M1，需要装依赖）：

1. `packages/ui/**/*.css` 中不得出现 `#[0-9a-f]{3,8}` 与裸 `rgba(`，白名单仅 `tokens` 包。
2. `stylelint` 规则 `declaration-property-value-allowed-list`：`background|color|border-color|border-radius|padding|margin|font-size|box-shadow`
   只接受 `var(--oj-*)` / `calc()` / `0` / `1px` / `transparent` / `currentColor` / `%`。
3. 视觉回归：对 `light/dark × comfortable/compact × zh/zh-TW/ja` = **2 × 2 × 3 = 12** 组主题组合，
   逐组件截图比对，阈值 0.1%。`en` 不进这个笛卡尔积——它不改变任何 token（§7），
   但它是文档站的界面语言，文案长度差异另走一组"组件在窄英/宽德文案下不溢出"的用例，
   与主题维度相乘会把快照数量翻十倍而没有额外覆盖。
