/**
 * 节点扩展目录。形状对齐 Tiptap 的 Node：
 * https://tiptap.dev/docs/editor/extensions/nodes
 *
 * 每个节点声明 name、group、content、parseHTML、命令名、快捷键和输入规则。
 * 这里不 import `@tiptap/*`。命令真正改文档的函数在 `document.ts`。
 */
export type OjNodeGroup = 'block' | 'inline';
export interface OjParseRule {
    tag: string;
}
export interface OjNodeExtension {
    name: string;
    group: OjNodeGroup;
    /** 与 Tiptap schema 的 content 表达式相同，例如 `block+`、`inline*`。 */
    content: string;
    atom?: boolean;
    defining?: boolean;
    parseHTML: readonly OjParseRule[];
    /** 渲染用的标签。标题按 level 在渲染时选择 h1–h6。 */
    renderTag: string;
    commands: readonly string[];
    shortcuts: Readonly<Record<string, string>>;
    /** 光标前文本需要整段匹配的输入规则。空正则表示这个节点没有输入规则。 */
    input?: RegExp;
    markdownToken?: string;
    markdown?: string;
}
export declare const documentNode: OjNodeExtension;
export declare const paragraphNode: OjNodeExtension;
export declare const textNode: OjNodeExtension;
export declare const headingNode: OjNodeExtension;
export declare const blockquoteNode: OjNodeExtension;
export declare const bulletListNode: OjNodeExtension;
export declare const orderedListNode: OjNodeExtension;
export declare const listItemNode: OjNodeExtension;
export declare const codeBlockNode: OjNodeExtension;
export declare const hardBreakNode: OjNodeExtension;
export declare const horizontalRuleNode: OjNodeExtension;
export declare const imageNode: OjNodeExtension;
/** 与 Tiptap StarterKit 的节点集合对应，另加 image。 */
export declare const starterNodes: readonly OjNodeExtension[];
export declare function nodeExtension(name: string): OjNodeExtension | undefined;
export interface OjInputMatch {
    node: string;
    consume: number;
    level?: number;
    language?: string;
}
/** 把光标前的文本交给各节点的 input。先匹配的规则生效。 */
export declare function matchNodeInput(before: string): OjInputMatch | null;
