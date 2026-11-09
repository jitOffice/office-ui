/**
 * 文件名与保存态模型（03 §3 F 组 `OjFileNameHeader`）。
 *
 * 校验放在纯函数里，是因为"文件名哪里不合法"这件事有平台差异，而浏览器里最难复现的正是它：
 * Windows 拦 `\ / : * ? " < > |`，macOS 只拦 `/`，Linux 只拦 `/` 与 `\0`。
 * 组件按**最严的那个**（Windows）校验：跨平台文档库里建出来的名字，必须在每个平台都能落地。
 *
 * 保存态只有三档，且**不可跳过**：`saved → saving → saved`（或 `→ unsaved`）。
 * 不做"隐藏的第四档"（如"冲突"）：冲突要先决定合并策略，那是内核的事，不是标题栏能表达的。
 */
export type SaveState = 'saved' | 'saving' | 'unsaved';
/** 文件名问题的种类。文案由使用方按种类翻译，组件里不拼句子。 */
export type FileNameProblem = 'empty' | 'illegal' | 'reserved';
/**
 * 校验文件名。返回 `undefined` 表示可用。
 *
 * 首尾空白先裁掉再判空：`"  "` 是用户想清空名字的常见中间态，它必须报 `empty` 而不是"可用"。
 * `.` 与 `..` 归到 `reserved`：它们在所有平台上都不是合法文件名，但也不是"空"。
 */
export declare function fileNameProblem(name: string): FileNameProblem | undefined;
export interface RenameOk {
    readonly ok: true;
    readonly name: string;
}
export interface RenameFail {
    readonly ok: false;
    readonly problem: FileNameProblem;
}
/**
 * 重命名结果。**与原值相同视为成功且返回原名**（不是"没变化所以失败"）：
 * 用户回车确认一个没改的名字，界面应该退出编辑态，而不是弹错误。
 */
export declare function renameFile(current: string, next: string): RenameOk | RenameFail;
/**
 * 保存态是否处于"还没落盘"的状态。
 *
 * 标题栏要据此显示小圆点/星号，而 `saving` 也算未落盘：显示成"已保存"再改回来，
 * 用户会看到状态闪两下，误以为保存失败了两次。
 */
export declare function isDirty(state: SaveState): boolean;
