---
'@jitoffice/ui': minor
---

`OjIcon` 新增 `spin` 开关（默认 `false`），用于加载态旋转：

- 组件只挂 `oj-icon--spin` 类名，动画写在样式表里——内联 `animation` 会绕开
  `prefers-reduced-motion` 的媒体查询，而持续旋转对前庭功能障碍用户是实际伤害；
  系统开了"减少动态效果"时该图标**停转**。
- 周期取 token `--oj-motion-duration-slow`（300ms），不写死时延，主题改 token 即生效。

升级方式：纯新增 prop，既有代码无需改动。
