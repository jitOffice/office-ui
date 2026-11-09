---
'@jitoffice/ui': minor
---

M3 收尾四件：`OjDragDropContext`、`OjShareDialog`、`OjVersionHistory`、`OjUploadProgress`，
行为层分别是 `shell/drag-context.ts` / `shell/share.ts` / `shell/versions.ts` / `shell/upload.ts`。
至此 M3 的 14 件全部交付。

- **`OjDragDropContext`**：用私有 MIME 标记 `application/x-oj-drag` 区分内部拖拽与外部拖入——
  拖选区内文字同样带 `text/html`，只看标准类型永远分不开。`negotiateTransfer()` 只按 MIME 提前挡，
  扩展名规则一律放行到 drop 再由 `selectDropped` 细判；文本载荷默认不接管。通过
  `OJ_DRAG_CONTEXT` / `useOjDragContext()` 把只读拖拽状态注入子组件。
- **`OjShareDialog`**：`resolveShare()` 是唯一真值——私有没有角色、有效期只跟链接、人数只跟指定人；
  切范围时角色当场降级（链接范围不给"可编辑"）。确认上抛的是归一化后的权限，不是界面状态的拷贝。
- **`OjVersionHistory`**：排序只看时间（改名不改顺序）；恢复是 `idle → confirming → restoring` 状态机，
  确认条贴在被恢复的那一条下面（`role="alertdialog"`）；行内命名 Enter / 失焦提交、Esc 取消、
  清空退回自动版本。
- **`OjUploadProgress`**：进度只增不减（暂停期间到达的分片回报直接丢弃）；失败保留断点，重试从
  `loaded` 续传；分片按字节对齐整片重发（分片 PUT 幂等）；每种状态只出一个动作按钮（暂停 / 续传 / 重试），
  失败原因写在进度条下面。

升级方式：纯新增组件与函数，既有 API 不变。
