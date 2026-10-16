/**
 * Tiptap 形编辑器的命令桥。
 *
 * 这里故意不 import `@tiptap/core`：节点实现（`<hr>` 解析、光标落到规则后、文末补段落、
 * 行首 `---` 输入规则）留在内核，见 prd/06。本文件只把稳定的命令 id 译成 Tiptap 的方法名。
 */
import type { OjEditorHost } from './editor-host.ts';
/** Tiptap `Editor` 上这几条命令实际用到的那一小面。方法缺失时视为当前不能执行。 */
export interface TiptapLikeEditor {
    isActive(name: string): boolean;
    can(): Record<string, (() => boolean) | undefined>;
    commands: Record<string, ((arg?: unknown) => boolean) | undefined>;
    on(event: string, handler: () => void): void;
    off(event: string, handler: () => void): void;
}
export declare function tiptapEditorHost(editor: TiptapLikeEditor): OjEditorHost;
