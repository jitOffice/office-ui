import type { PropType } from 'vue';
import type { DropAccept, DropRejection, DroppedFile } from '../shell/drop-zone.cjs';
/** 受理通过的文件：`DroppedFile` 的字段供判定，`file` 原样交回宿主去上传。 */
export interface OjDroppedFile extends DroppedFile {
    readonly file: File;
}
/** 非文件载荷（富文本导入 / 纯文本插入）。取不到的那一项为空串。 */
export interface OjTextPayload {
    readonly html: string;
    readonly text: string;
}
/**
 * `OjDropZone`（03 §3 F 组）：拖放导入 + 整页遮罩 + 类型校验 + 多文件 + 粘贴图片。
 *
 * 三个"不做就会错"的点：
 *   - **按 `DataTransfer.types` 分支**（03 §8.9）。文件、`text/html`、`text/plain` 是三种载荷，
 *     不分支会把"从网页拖一段文字"判成"格式不支持的文件"，提示方向完全相反。
 *     文本分支默认关闭（`textPayload`），否则拖选区内文字也会弹出导入遮罩。
 *   - **整页遮罩用计数器进出**。`dragenter` / `dragleave` 在子元素间移动时会成对触发，
 *     只看单个事件会让遮罩疯狂闪；只有计数归零（或 `relatedTarget === null` 离开窗口）才收起。
 *   - **拒绝要说出原因**。`type`（格式不支持）与 `count`（一次只能一个）是两句话，
 *     混成"导入失败"会让用户改错方向。
 *
 * 全页监听而不是只监听根元素：文档编辑器的拖放目标是画布/文档区，不是这个包裹层；
 * 遮罩本身 `pointer-events: none`，不会挡住 `drop`。代价要写在明面上——**一个页面只应有的一个实例**：
 * 同页挂两个会各自收到同一次 drop / paste（需要区分时由宿主拆页面，或把整个应用包进一个实例）。
 */
export declare const OjDropZone: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    accept: {
        type: PropType<DropAccept>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 遮罩主文案（"松开以导入"）。 */
    title: {
        type: StringConstructor;
        required: true;
    };
    /** 遮罩副文案（"支持 .docx / .pdf，最多 5 个"），由宿主拼好。 */
    hint: {
        type: StringConstructor;
        default: string;
    };
    /** 打开文件选择框的按钮文案；留空则不出现按钮。 */
    browseLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 两类拒绝的原因文案，按种类给（组件不拼句子）。 */
    rejectLabels: {
        type: PropType<Readonly<Partial<Record<DropRejection, string>>>>;
        default: () => Readonly<Partial<Record<DropRejection, string>>>;
    };
    /** 拒绝提示保留多久（ms）；`0` 表示留到下一次成功导入。 */
    messageDuration: {
        type: NumberConstructor;
        default: number;
    };
    /** 是否接管 `text/html` / `text/plain` 拖放（富文本导入、纯文本插入）。 */
    textPayload: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("files" | "insert" | "reject")[], "files" | "insert" | "reject", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    accept: {
        type: PropType<DropAccept>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    /** 遮罩主文案（"松开以导入"）。 */
    title: {
        type: StringConstructor;
        required: true;
    };
    /** 遮罩副文案（"支持 .docx / .pdf，最多 5 个"），由宿主拼好。 */
    hint: {
        type: StringConstructor;
        default: string;
    };
    /** 打开文件选择框的按钮文案；留空则不出现按钮。 */
    browseLabel: {
        type: StringConstructor;
        default: string;
    };
    /** 两类拒绝的原因文案，按种类给（组件不拼句子）。 */
    rejectLabels: {
        type: PropType<Readonly<Partial<Record<DropRejection, string>>>>;
        default: () => Readonly<Partial<Record<DropRejection, string>>>;
    };
    /** 拒绝提示保留多久（ms）；`0` 表示留到下一次成功导入。 */
    messageDuration: {
        type: NumberConstructor;
        default: number;
    };
    /** 是否接管 `text/html` / `text/plain` 拖放（富文本导入、纯文本插入）。 */
    textPayload: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onFiles?: (...args: any[]) => any;
    onInsert?: (...args: any[]) => any;
    onReject?: (...args: any[]) => any;
}>, {
    accept: DropAccept;
    disabled: boolean;
    hint: string;
    browseLabel: string;
    rejectLabels: Readonly<Partial<Record<DropRejection, string>>>;
    messageDuration: number;
    textPayload: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
