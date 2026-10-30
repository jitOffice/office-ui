---
'@jitoffice/ui': minor
---

新增运行时图标注册表（05 C1 余项）：`registerIcon` / `registerIcons` / `unregisterIcon` /
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
