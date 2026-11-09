import type { InjectionKey, PropType, Ref } from 'vue';
import type { DragNegotiation, TransferKind } from '../shell/drag-context.cjs';
/** 注入给子组件的拖放上下文：只读状态，子组件据此做高亮、插入指示线等。 */
export interface OjDragContextState {
    readonly dragging: Readonly<Ref<boolean>>;
    readonly kind: Readonly<Ref<TransferKind | 'none'>>;
    /** 内部拖拽的宿主数据（被拖块 id 等）；外部拖入时为空串。 */
    readonly data: Readonly<Ref<string>>;
}
export declare const OJ_DRAG_CONTEXT: InjectionKey<OjDragContextState>;
/** 子组件读取上下文。没有 `OjDragContext` 包裹时返回 `undefined`，调用方按"不在拖拽"处理。 */
export declare function useOjDragContext(): OjDragContextState | undefined;
/**
 * `OjDragContext`（03 §3 D 组）：拖放协议的统一入口，区分内部拖拽与外部拖入。
 *
 * 与 `OjDropZone` 的分工：`OjDropZone` 是"整页遮罩 + 文件受理"的成品；
 * 这里是"协议层"——不画遮罩，只判断这次拖拽归谁、是什么载荷，然后上抛。
 * 需要"拖拽高亮 + 内部排序 + 外部文件导入"同屏共存时用这个。
 *
 * 组件本身不产生盒子（`display: contents`）：它套在布局外面，但布局仍由内部的
 * 分栏/网格决定。`data-kind` / `data-dragging` 落在包裹元素上，宿主用属性选择器做高亮。
 */
export declare const OjDragContext: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    accept: {
        type: PropType<DragNegotiation>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("drop" | "enter" | "leave")[], "drop" | "enter" | "leave", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    accept: {
        type: PropType<DragNegotiation>;
        default: () => {};
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{
    onDrop?: (...args: any[]) => any;
    onEnter?: (...args: any[]) => any;
    onLeave?: (...args: any[]) => any;
}>, {
    accept: DragNegotiation;
    disabled: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
