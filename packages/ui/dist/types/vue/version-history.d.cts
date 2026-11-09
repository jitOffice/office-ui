import type { PropType } from 'vue';
import type { VersionEntry } from '../shell/versions.cjs';
/**
 * `OjVersionHistory`（03 §3 E 组）：版本时间线，支持预览、命名、恢复（带确认）。
 *
 * 恢复**必须二次确认**，而且确认条就贴在那一条下面：弹窗确认里用户看不到自己要覆盖的是哪个版本，
 * 只能凭记忆点"确定"。确认条用 `role="alertdialog"`，读屏也会先念"覆盖当前内容？"。
 *
 * 命名用行内输入：改完按 Enter 或失焦提交、Esc 取消、清空等于退回自动版本
 * （`renameVersion` 把空名字处理成"去掉名字"）。命名不改顺序——排序只看时间，
 * 否则用户刚改完名字，那一条就跳到别处去了。
 *
 * 时间格式化交给宿主（`formatTime`），组件不猜地区格式。
 */
export declare const OjVersionHistory: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    entries: {
        type: PropType<readonly VersionEntry[]>;
        required: true;
    };
    /** 列表的可访问名（"版本历史"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    previewLabel: {
        type: StringConstructor;
        required: true;
    };
    restoreLabel: {
        type: StringConstructor;
        required: true;
    };
    renameLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 确认条上的提示（"恢复后当前内容会被覆盖"）。 */
    restorePrompt: {
        type: StringConstructor;
        required: true;
    };
    confirmRestoreLabel: {
        type: StringConstructor;
        required: true;
    };
    cancelRestoreLabel: {
        type: StringConstructor;
        required: true;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 时间格式化；默认用系统地区格式，宿主可换成固定格式。 */
    formatTime: {
        type: PropType<(at: number) => string>;
        default: (at: number) => string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("preview" | "rename" | "restore")[], "preview" | "rename" | "restore", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    entries: {
        type: PropType<readonly VersionEntry[]>;
        required: true;
    };
    /** 列表的可访问名（"版本历史"）。 */
    label: {
        type: StringConstructor;
        required: true;
    };
    previewLabel: {
        type: StringConstructor;
        required: true;
    };
    restoreLabel: {
        type: StringConstructor;
        required: true;
    };
    renameLabel: {
        type: StringConstructor;
        required: true;
    };
    /** 确认条上的提示（"恢复后当前内容会被覆盖"）。 */
    restorePrompt: {
        type: StringConstructor;
        required: true;
    };
    confirmRestoreLabel: {
        type: StringConstructor;
        required: true;
    };
    cancelRestoreLabel: {
        type: StringConstructor;
        required: true;
    };
    emptyLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 时间格式化；默认用系统地区格式，宿主可换成固定格式。 */
    formatTime: {
        type: PropType<(at: number) => string>;
        default: (at: number) => string;
    };
}>> & Readonly<{
    onPreview?: (...args: any[]) => any;
    onRename?: (...args: any[]) => any;
    onRestore?: (...args: any[]) => any;
}>, {
    emptyLabel: string;
    formatTime: (at: number) => string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
