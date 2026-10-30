---
'@jitoffice/ui': minor
---

新增无构建器入口（02 §4.2 / §4.3），UMD 上即 `OfficeUI.create` / `OfficeUI.hydrate` / `OfficeUI.configure`：

- `create(name, { anchor, props, on })` 命令式创建组件，返回 `{ el, setProps, destroy }`；
  容器插在 `anchor` 之后，`on` 的键就是 Vue 的 emit 名（`'update:open'` → `onUpdate:open`）。
- `hydrate(root?)` 扫描 `[data-oj]`，支持 `data-oj-props`（JSON）与 `data-oj-prop-*`（逐属性、
  嵌套写法 `data-oj-prop-max-rows`、`data-oj-prop-on-select="window.fn"`）；重复调用不会重复挂载。
- `configure({ i18n })` 让上述独立实例与页面共用同一个语言上下文——不配的话，
  命令式创建的弹层会回落到默认语言，与页面不一致。

升级方式：无需改动既有代码，纯新增导出。`resolveOjComponent` / `ojComponentNames` /
`OfficeUI.components` 可用来查已注册的 34 个组件名。
