# @jitoffice/ui

## 0.1.0

### Minor Changes

- bc4b116: 新增运行时图标注册表（05 C1 余项）：`registerIcon` / `registerIcons` / `unregisterIcon` /
  `registeredIconNames` / `resetRegisteredIcons`，从 `@jitoffice/ui` 根入口导出（框架无关，不拖 vue）。
  
  用途：业务图标（客户 logo、行业符号、内部状态）不必再自己写 `v-html`——注册后直接用
  `<OjIcon name="acme-logo" label="…" />`，尺寸、`currentColor` 继承与无障碍行为全部复用同一条通道。
  `iconMarkup()` 的查表顺序是**注册表优先**。
  
  注册期就拒绝（抛错，而不是渲染成空白）：
  
  - 非 kebab-case 的名字，以及占用内置 `oj-*` 命名空间的名字（允许覆盖 `oj-close` 会让同一份代码
    在不同应用里长得不一样）；
  - 不是单个 `<svg>`、或缺少 `viewBox` 的 markup（缺 viewBox 会被压成 0×0，常被误判成打包问题）；
  - 含 `on*=` 内联事件、`<script>`、`javascript:`、`<foreignObject>`、外链 `href` 或 `<image>` 的 markup——
    组件用 `innerHTML` 渲染，业务图标的字符串常来自图标包或后端，不做这层检查等于把注入面开给调用方。
  
  `registerIcons` 是原子的：一条不合格则一条都不写入。同名重复注册**允许覆盖**（主题切换、
  微前端按需替换）。
- bc4b116: `OjIcon` 新增 `spin` 开关（默认 `false`），用于加载态旋转：
  
  - 组件只挂 `oj-icon--spin` 类名，动画写在样式表里——内联 `animation` 会绕开
    `prefers-reduced-motion` 的媒体查询，而持续旋转对前庭功能障碍用户是实际伤害；
    系统开了"减少动态效果"时该图标**停转**。
  - 周期取 token `--oj-motion-duration-slow`（300ms），不写死时延，主题改 token 即生效。
  
  升级方式：纯新增 prop，既有代码无需改动。
- bc4b116: 新增无构建器入口（02 §4.2 / §4.3），UMD 上即 `OfficeUI.create` / `OfficeUI.hydrate` / `OfficeUI.configure`：
  
  - `create(name, { anchor, props, on })` 命令式创建组件，返回 `{ el, setProps, destroy }`；
    容器插在 `anchor` 之后，`on` 的键就是 Vue 的 emit 名（`'update:open'` → `onUpdate:open`）。
  - `hydrate(root?)` 扫描 `[data-oj]`，支持 `data-oj-props`（JSON）与 `data-oj-prop-*`（逐属性、
    嵌套写法 `data-oj-prop-max-rows`、`data-oj-prop-on-select="window.fn"`）；重复调用不会重复挂载。
  - `configure({ i18n })` 让上述独立实例与页面共用同一个语言上下文——不配的话，
    命令式创建的弹层会回落到默认语言，与页面不一致。
  
  升级方式：无需改动既有代码，纯新增导出。`resolveOjComponent` / `ojComponentNames` /
  `OfficeUI.components` 可用来查已注册的 34 个组件名。

### Patch Changes

- bc4b116: 组件样式里的字号改为走 token（16 处 `12px` / `14px` / `20px` → `var(--oj-fs-12|14|20)`），
  并新增门禁 `pnpm lint:css-magic` 防止回退。
  
  为什么值得改：字号写死后，`ja` 档位把 `--oj-fs-14` 覆写成 13px 时组件不会跟着降——
  日文界面下工具栏反而比中文大一号。改成 token 之后，语言档位与 `compact` 密度档位对字号的
  覆写才能真的生效（`compact` 下 14px → 13px 是预期变化，不是回归）。
  
  三处刻意保留字面量，并在门禁里逐条登记了理由：`.oj-ruler` 刻度 10px（读数要比正文小一档）、
  `.oj-watermark__layer` 48px（水印要横跨整页）、`.oj-ribbon__keytip` 11px（16px 方框内单字符）。
  间距与圆角的魔法数**仍未守**：token 标度覆盖不了 2px / 7px / 28px / 56px，需要先定标度。
