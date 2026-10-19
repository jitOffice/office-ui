/**
 * 文档树用 Tiptap / ProseMirror 的 JSON 形状：`{ type, attrs, content, text }`。
 * 选区用从 `doc.content` 出发的下标路径，不依赖 ProseMirror。
 */
export interface OjNode {
    type: string;
    attrs?: Readonly<Record<string, string | number | boolean | null>>;
    text?: string;
    content?: readonly OjNode[];
}
export type OjSelection = {
    kind: 'text';
    path: readonly number[];
    offset: number;
} | {
    kind: 'node';
    path: readonly number[];
    offset: number;
};
export interface OjDocument {
    doc: OjNode;
    selection: OjSelection;
}
export declare function isTextblockType(type: string): boolean;
export declare function createDocument(text?: string): OjDocument;
export declare function textblock(type: string, text: string, attrs?: OjNode['attrs']): OjNode;
/** 文本块的可见文字。硬换行算作一个换行符。 */
export declare function blockPlain(node: OjNode): string;
export declare function nodeAt(root: OjNode, path: readonly number[]): OjNode | null;
export declare function spliceChildren(root: OjNode, parentPath: readonly number[], index: number, deleteCount: number, insert: readonly OjNode[]): OjNode;
export interface TextblockHit {
    path: readonly number[];
    node: OjNode;
    start: number;
    end: number;
}
/** 按阅读顺序收集文本块。块与块之间用换行符隔开，和 `plainText` 一致。 */
export declare function textblocks(root: OjNode): TextblockHit[];
export declare function plainText(doc: OjDocument): string;
export declare function withPlain(doc: OjDocument, plain: string): OjDocument;
