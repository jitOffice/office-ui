/**
 * 编辑命令。UI 不实现加粗、分隔线、插表，只把它们登记进命令表。
 *
 * 注册表本身来自 `@jitoffice/shared`。这里用结构类型接收，是为了行为层不出现包名导入：
 * `pnpm verify` 在没有 node_modules 时仍要能跑到这些文件。
 */
import type { OjEditorHost, OjEditorState } from './editor-host.ts';
export declare const COMMAND_BOLD = "format.bold";
export declare const COMMAND_ITALIC = "format.italic";
export declare const COMMAND_UNDERLINE = "format.underline";
export declare const COMMAND_ALIGN_LEFT = "format.alignLeft";
export declare const COMMAND_HEADING = "format.heading";
export declare const COMMAND_BLOCKQUOTE = "format.blockquote";
export declare const COMMAND_BULLET_LIST = "format.bulletList";
export declare const COMMAND_ORDERED_LIST = "format.orderedList";
export declare const COMMAND_CODE_BLOCK = "format.codeBlock";
export declare const COMMAND_HARD_BREAK = "insert.hardBreak";
export declare const COMMAND_HORIZONTAL_RULE = "insert.horizontalRule";
export declare const COMMAND_TABLE = "insert.table";
export interface TableSize {
    rows: number;
    cols: number;
}
export interface OjCommandLike {
    id: string;
    label: string | {
        key: string;
    };
    icon?: string;
    keys?: string;
    group?: string;
    history?: 'undoable' | 'transient' | 'none';
    state?: (host: OjEditorHost) => OjEditorState;
    run: (host: OjEditorHost, arg?: unknown) => void;
}
export interface OjCommandSink {
    register(command: OjCommandLike): () => void;
}
export declare function isHeadingLevel(arg: unknown): arg is {
    level: number;
};
export declare function isTableSize(arg: unknown): arg is TableSize;
export declare function editorCommands(): readonly OjCommandLike[];
/** 登记编辑命令，返回一次性注销。 */
export declare function registerEditorCommands(sink: OjCommandSink): () => void;
