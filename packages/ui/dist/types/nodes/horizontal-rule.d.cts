/**
 * 分隔线节点，对齐 Tiptap `HorizontalRule`（`@tiptap/extension-horizontal-rule`）。
 *
 * 不 import `@tiptap/*`，也不操作 ProseMirror transaction。这里只保留那条节点对外可观察的约定：
 * 块级 `hr`、`setHorizontalRule` 之后光标落在规则后、文末没有节点时补 `nextNodeType`、
 * 行首 `---` / `—-` / `___ ` / `*** ` 变成节点。真正的编辑器仍由宿主执行
 * `commands.setHorizontalRule()`，见 `tiptapEditorHost`。
 */
import type { OjDocument } from './tree.cjs';
export declare const HORIZONTAL_RULE_NAME = "horizontalRule";
export declare const HORIZONTAL_RULE_GROUP = "block";
/** Markdown 词法名。渲染结果是 `---`。 */
export declare const HORIZONTAL_RULE_MARKDOWN_TOKEN = "hr";
export declare const HORIZONTAL_RULE_MARKDOWN = "---";
/**
 * 与 Tiptap `nodeInputRule` 的 `find` 相同。
 * 第二支是 U+2014 EM DASH 再加一个连字符。
 */
export declare const HORIZONTAL_RULE_INPUT: RegExp;
export interface HorizontalRuleOptions {
    HTMLAttributes: Readonly<Record<string, string>>;
    /** 规则插在文末时补上的文本块。未知名字退回段落。 */
    nextNodeType: string;
}
export interface OjHorizontalRule {
    type: 'horizontalRule';
    htmlAttributes: Readonly<Record<string, string>>;
}
export declare function horizontalRuleOptions(partial?: Partial<HorizontalRuleOptions>): HorizontalRuleOptions;
export declare function isHorizontalRuleInput(text: string): boolean;
/** 后者覆盖前者。事件处理属性名会被丢掉。 */
export declare function mergeAttributes(...sources: readonly (Readonly<Record<string, string>> | undefined)[]): Record<string, string>;
/** `parseHTML: [{ tag: 'hr' }]`。只接受单独一个 hr 标签。 */
export declare function parseHorizontalRuleHTML(html: string): OjHorizontalRule | null;
/** `renderHTML`：选项上的 HTMLAttributes 打底，节点自己的属性覆盖。 */
export declare function renderHorizontalRule(node: OjHorizontalRule, options?: Partial<HorizontalRuleOptions>): string;
export declare function renderHorizontalRuleMarkdown(): string;
export declare function parseHorizontalRuleMarkdown(token: string): boolean;
/**
 * `setHorizontalRule()`。
 * 文本光标把当前文本块拆开，规则插在中间；节点选区则插在选中块之后。
 * 后面已有文本块时，光标进到那个块的开头；后面是别的块时改成节点选区；
 * 后面什么都没有时补 `nextNodeType`（默认段落）。
 */
export declare function setHorizontalRule(doc: OjDocument, options?: Partial<HorizontalRuleOptions>): OjDocument;
/**
 * 输入规则。光标在文本块末尾，且光标前的整段匹配 `HORIZONTAL_RULE_INPUT` 时，
 * 用分隔线换掉这一段，光标规则与 `setHorizontalRule` 相同。
 */
export declare function applyHorizontalRuleInput(doc: OjDocument, options?: Partial<HorizontalRuleOptions>): OjDocument | null;
