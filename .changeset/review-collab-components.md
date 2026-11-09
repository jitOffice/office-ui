---
'@jitoffice/ui': minor
'@jitoffice/i18n': minor
---

新增 M3 第一批四件：`OjCommentThread`、`OjReviewPanel`、`OjPresenceAvatars`、`OjFileNameHeader`，
以及它们的行为层（`shell/comments.ts` / `shell/review.ts` / `shell/people.ts` / `shell/file-name.ts`）。

- **全是受控组件**：回复走 `reply` 事件、解决态走 `toggle-resolved`、修订决策走 `decide` / `decide-all`、
  收藏走 `update:favored`。组件不自己改传进来的数据——批注要落盘、要协同同步，内部藏一份状态就会与真值分叉。
- **"全部接受/拒绝"只作用于当前筛选结果**（`decideAll(changes, filter)`），面板把筛选条件随事件带出，
  宿主用同一条件复算；在"只看某人"的筛选下连别人的修订一起处理是数据事故。
- **头像颜色与首字母由 `id`/姓名派生**（`avatarTone()` / `initialsOf()`），不接受外部传样式：
  同一人在批注区与标题栏必须是同一个颜色；中日韩名字取首字（取末字会让"张伟/王伟"撞字）。
- **文件名按 Windows 最严规则校验**（`fileNameProblem()`，`CON.txt` 也算保留名），非法名不退出编辑态。
- **保存态三档**（`saved`/`saving`/`unsaved`）不可跳过，`isDirty('saving') === true`。
- 文案全部由使用方给，`@jitoffice/i18n` 四语补 26 个 key（`oj.comment.*` / `oj.review.*` /
  `oj.presence.*` / `oj.fileName.*` / `oj.shell.review.title`），种类名与线型名走映射而不是拼接。

升级方式：纯新增组件与函数，既有 API 不变。
