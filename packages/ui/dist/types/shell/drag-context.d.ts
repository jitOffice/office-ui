/**
 * 拖放协议：区分**内部拖拽**与**外部拖入**（03 §3 D 组 `OjDragDropContext`，§8.9 类型协商）。
 *
 * 不看 MIME 就统一处理，是本项目里最容易犯的错：
 *   - 把"拖动文档里选中的一段字"当成"拖进来一个文件"，弹"只收 .docx"；
 *   - 把"从桌面拖进来的文件"当成内部拖动，直接插进正文变成一段二进制乱码。
 *
 * 判定靠一个私有 MIME 标记：内部拖拽在 `dragstart` 里写进 `DRAG_MARKER`，
 * 外部来源不可能带这个类型。相比"记住鼠标按下了"之类的猜测，这是唯一稳定的信号。
 */
import type { DropAccept, DropPayloadKind } from './drop-zone.ts';
/** 内部拖拽标记。私有 MIME 不会被任何外部应用发出。 */
export declare const DRAG_MARKER = "application/x-oj-drag";
export type TransferKind = DropPayloadKind | 'internal';
export interface DragPayload<F = unknown> {
    readonly kind: TransferKind;
    readonly files: readonly F[];
    readonly html: string;
    readonly text: string;
    /** 内部拖拽时宿主自己带的数据（被拖的块 id、行号之类）。 */
    readonly data: string;
}
/** `DataTransfer` 的只读投影：drops 之外也方便测试构造。 */
export interface DragTransfer<F> {
    readonly types: readonly string[];
    readonly files: readonly F[];
    getData(format: string): string;
}
export interface DragWriter {
    setData(format: string, data: string): void;
}
export interface InternalDragPayload {
    readonly id: string;
    readonly html?: string;
    readonly text?: string;
}
/** 内部拖拽写入的内容：标记 + 宿主数据 + 可选富文本兜底（拖到别的应用时还能用）。 */
export declare function writeInternalDrag(transfer: DragWriter, payload: InternalDragPayload): void;
/**
 * 读一次拖放载荷。`types` 里带标记就是内部拖拽，此时不再当文件处理——
 * 内部拖拽同样会带 `text/html`，只看那些类型永远分不开。
 */
export declare function readTransfer<F>(transfer: DragTransfer<F>): DragPayload<F>;
export interface DragNegotiation extends DropAccept {
    /** 是否接管 `text/html` / `text/plain`（默认不接管，否则拖选区内文字也会被当成导入）。 */
    readonly text?: boolean;
}
/**
 * 这次拖拽是否归我们处理。
 *
 * 文件分支的规则很别扭但必须这样：`accept.types` 里只有扩展名（`.docx`）时，
 * 拖入阶段**没有文件名**，只能放行，等 `drop` 再靠 `selectDropped` 判；
 * 反过来若按"扩展名不匹配 MIME"直接拒绝，用户会看到遮罩根本不出现，也就再没法导入。
 * 含 `/` 的规则（`application/pdf`、`image/*`）则必须命中，能提前挡掉明显不对的拖拽。
 */
export declare function negotiateTransfer(types: readonly string[], accept?: DragNegotiation): boolean;
