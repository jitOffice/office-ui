/**
 * 节点命令。名字与 Tiptap 的 `editor.commands.*` 相同，作用在 {@link OjDocument} 上。
 * 接到真正的 Tiptap 时不要再调用这些函数，命令桥会把 id 交给编辑器自己的实现。
 */
import type { OjDocument } from './tree.cjs';
export declare function toggleHeading(doc: OjDocument, level: number): OjDocument;
export declare function toggleCodeBlock(doc: OjDocument): OjDocument;
export declare function toggleBlockquote(doc: OjDocument): OjDocument;
export declare function toggleBulletList(doc: OjDocument): OjDocument;
export declare function toggleOrderedList(doc: OjDocument): OjDocument;
export declare function setHardBreak(doc: OjDocument): OjDocument;
/** 光标前的文本命中某个节点的输入规则时，换成那个节点并删掉标记。 */
export declare function applyNodeInput(doc: OjDocument): OjDocument | null;
