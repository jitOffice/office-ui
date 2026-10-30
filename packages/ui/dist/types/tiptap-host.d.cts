/**
 * Tiptap 形编辑器的命令桥。
 *
 * 这里故意不 import `@tiptap/core`。分隔线的节点约定在 `nodes/horizontal-rule.ts`，
 * 给没有 ProseMirror 的宿主用。接到真正的 Tiptap 时，本文件只把命令 id 译成
 * `commands.setHorizontalRule()`，光标和输入规则由那个编辑器自己执行。
 */
import type { OjEditorHost } from './editor-host.cjs';
/**
 * Tiptap `Editor` 上这几条命令实际用到的那一小面。方法缺失时视为当前不能执行。
 *
 * `isActive` 与 `can()` 里的方法都要能收参数：对齐不是布尔切换，Tiptap 用
 * `setTextAlign('left')` / `isActive({ textAlign: 'left' })` 表达方向与当前值。
 */
export interface TiptapLikeEditor {
    isActive(name: string | Record<string, unknown>): boolean;
    can(): Record<string, ((...args: unknown[]) => boolean) | undefined>;
    commands: Record<string, ((...args: unknown[]) => boolean) | undefined>;
    on(event: string, handler: () => void): void;
    off(event: string, handler: () => void): void;
}
/** 桥里登记过的命令 id。用来证明它和 `editorCommands()` 没有漂移。 */
export declare function bridgedCommandIds(): readonly string[];
export declare function tiptapEditorHost(editor: TiptapLikeEditor): OjEditorHost;
